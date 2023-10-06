import { nanoid } from "nanoid";
import { ChatControllerPool } from "../client/controller";
import { LLMApi, RequestMessage } from "../client/platforms/llm";
import { DEFAULT_INPUT_TEMPLATE } from "../constant";
import { getLang } from "../locales";
import { FileWrap, PDFFile, PlainTextFile } from "../utils/file";
import { prettyObject } from "../utils/format";
import { fetchSiteContent, isURL } from "../utils/url";
import { Bot, createEmptyBot } from "./bot";
import { ModelConfig, ModelType } from "./config";

export type URLDetail = {
  url: string;
  size: number;
  type: "text/html" | "application/pdf" | "text/plain";
};

export type URLDetailContent = URLDetail & {
  content?: string;
};

export type ChatMessage = RequestMessage & {
  date: string;
  streaming?: boolean;
  isError?: boolean;
  errorMsg?: string;
  id: string;
  model?: ModelType;
  urlDetail?: URLDetail;
};

export function createMessage(override: Partial<ChatMessage>): ChatMessage {
  return {
    id: nanoid(),
    date: new Date().toLocaleString(),
    role: "user",
    content: "",
    ...override,
  };
}

export interface ChatSession {
  id: string;

  messages: ChatMessage[];
  clearContextIndex?: number;

  bot: Bot;
}

export function createEmptySession(bot?: Bot): ChatSession {
  return {
    id: nanoid(),
    messages: [],

    bot: bot ?? createEmptyBot(),
  };
}

function fillTemplateWith(input: string, modelConfig: ModelConfig) {
  const vars = {
    model: modelConfig.model,
    time: new Date().toLocaleString(),
    lang: getLang(),
    input: input,
  };

  let output = modelConfig.template ?? DEFAULT_INPUT_TEMPLATE;

  // must contains {{input}}
  const inputVar = "{{input}}";
  if (!output.includes(inputVar)) {
    output += "\n" + inputVar;
  }

  Object.entries(vars).forEach(([name, value]) => {
    output = output.replaceAll(`{{${name}}}`, value);
  });

  return output;
}

async function createTextInputMessage(
  content: string,
  modelConfig: ModelConfig,
): Promise<ChatMessage> {
  if (isURL(content)) {
    const urlDetail = await fetchSiteContent(content);
    const userContent = urlDetail.content;
    delete urlDetail["content"]; // clean content in url detail as we already store it in the message
    console.log("[User Input] did get url detail: ", urlDetail, userContent);
    return createMessage({
      role: "user",
      content: userContent,
      urlDetail,
    });
  } else {
    const userContent = fillTemplateWith(content, modelConfig);
    console.log("[User Input] after template: ", userContent);

    return createMessage({
      role: "user",
      content: userContent,
    });
  }
}

async function getDetailContentFromFile(
  file: FileWrap,
): Promise<URLDetailContent> {
  switch (file.extension) {
    case "pdf": {
      const pdfFile = new PDFFile(file);
      return await pdfFile.getFileDetail();
    }
    case "txt": {
      const plainTextFile = new PlainTextFile(file);
      return await plainTextFile.getFileDetail();
    }
    default: {
      throw new Error("Not supported file type");
    }
  }
}

async function createFileInputMessage(file: FileWrap): Promise<ChatMessage> {
  const fileDetail = await getDetailContentFromFile(file);
  const textContent = fileDetail.content;
  delete fileDetail["content"];
  console.log(
    "[User Input] did get file upload detail: ",
    fileDetail,
    textContent,
  );
  return createMessage({
    role: "user",
    content: textContent,
    urlDetail: fileDetail,
  });
}

function transformUserMessageForSending(
  userMessage: ChatMessage,
): RequestMessage {
  const { content, urlDetail } = userMessage;
  if (!urlDetail) return userMessage;
  // if the user sends a URL message, let the LLM summarize the content of the URL
  return {
    role: userMessage.role,
    content: `Summarize the following text briefly in 200 words or less:\n\n${content}`,
  };
}

function transformAssistantMessageForSending(
  message: ChatMessage,
): RequestMessage {
  const { content } = message;
  // messages with role URL are assistant messages that contain a URL - the content is already retrieved by context-prompt.tsx
  if (message.role !== "URL") return message;
  return {
    role: "assistant",
    content,
  };
}

async function createUserMessage(
  content: string,
  modelConfig: ModelConfig,
  uploadedFile?: FileWrap,
): Promise<ChatMessage> {
  let userMessage: ChatMessage;
  if (uploadedFile) {
    userMessage = await createFileInputMessage(uploadedFile);
  } else {
    userMessage = await createTextInputMessage(content, modelConfig);
  }
  return userMessage;
}

export async function callSession(
  session: ChatSession,
  content: string,
  callbacks: {
    onUpdateMessages: (messages: ChatMessage[]) => void;
  },
  uploadedFile?: FileWrap,
): Promise<ChatMessage | undefined> {
  const modelConfig = session.bot.modelConfig;

  let userMessage: ChatMessage;

  try {
    userMessage = await createUserMessage(content, modelConfig, uploadedFile);
  } catch (error: any) {
    // an error occurred when creating user message, show error message as bot message and don't call API
    const userMessage = createMessage({
      role: "user",
      content,
    });
    const botMessage = createMessage({
      role: "assistant",
      id: userMessage.id! + 1,
      content: prettyObject({
        error: true,
        message: error.message || "Invalid user message",
      }),
    });
    // updating the session will trigger a re-render, so it will display the messages
    session.messages = session.messages.concat([userMessage, botMessage]);
    callbacks.onUpdateMessages(session.messages);
    return botMessage;
  }

  const botMessage: ChatMessage = createMessage({
    role: "assistant",
    streaming: true,
    model: modelConfig.model,
  });

  const contextPrompts = session.bot.context.slice();
  // get messages starting from the last clear context index (or all messages if there is no clear context index)
  const recentMessages = !session.clearContextIndex
    ? session.messages
    : session.messages.slice(session.clearContextIndex);
  const sendMessages = [
    ...contextPrompts,
    ...recentMessages.map(transformAssistantMessageForSending),
    transformUserMessageForSending(userMessage),
  ];
  const messageIndex = session.messages.length + 1;

  // save user's and bot's message
  const savedUserMessage = {
    ...userMessage,
    content,
  };
  session.messages = session.messages.concat([savedUserMessage, botMessage]);
  callbacks.onUpdateMessages(session.messages);

  // make request
  let result;
  const api = new LLMApi();
  await api.chat({
    messages: sendMessages,
    config: { ...modelConfig, stream: true },
    onUpdate(message) {
      botMessage.streaming = true;
      if (message) {
        botMessage.content = message;
      }
      callbacks.onUpdateMessages(session.messages.concat());
    },
    onFinish(message: string) {
      botMessage.streaming = false;
      if (message) {
        botMessage.content = message;
        callbacks.onUpdateMessages(session.messages.concat());
      }
      ChatControllerPool.remove(session.id, botMessage.id);
      result = botMessage;
    },
    onError(error) {
      const isAborted = error.message.includes("aborted");
      botMessage.content +=
        "\n\n" +
        prettyObject({
          error: true,
          message: error.message,
        });
      botMessage.streaming = false;
      userMessage.isError = !isAborted;
      botMessage.isError = !isAborted;
      callbacks.onUpdateMessages(session.messages);
      ChatControllerPool.remove(session.id, botMessage.id ?? messageIndex);

      console.error("[Chat] failed ", error);
      result = botMessage;
    },
    onController(controller) {
      // collect controller for stop/retry
      ChatControllerPool.addController(
        session.id,
        botMessage.id ?? messageIndex,
        controller,
      );
    },
  });
  return result;
}
