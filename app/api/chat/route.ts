import { Message, StreamData, StreamingTextResponse } from "ai";
import {
  ChatMessage,
  OpenAI,
  Settings,
  SimpleChatHistory,
  SummaryChatHistory,
} from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { createChatEngine } from "./engine/chat";
import { initSettings } from "./engine/settings";
import {
  LlamaIndexStream,
  convertMessageContent,
} from "@/cl/app/api/chat/llamaindex-stream";
import {
  createCallbackManager,
  createStreamTimeout,
} from "@/cl/app/api/chat/stream-helper";
import { LLMConfig } from "@/app/store/bot";

initSettings();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

interface ChatRequestBody {
  messages: Message[];
  context: Message[];
  modelConfig: LLMConfig;
  datasource?: string;
}

export async function POST(request: NextRequest) {
  // Init Vercel AI StreamData and timeout
  const vercelStreamData = new StreamData();
  const streamTimeout = createStreamTimeout(vercelStreamData);

  try {
    const body = await request.json();
    const { messages, context, modelConfig, datasource } =
      body as ChatRequestBody;
    const userMessage = messages.pop();
    if (!messages || !userMessage || userMessage.role !== "user") {
      return NextResponse.json(
        {
          error:
            "messages are required in the request body and the last message must be from the user",
        },
        { status: 400 },
      );
    }

    // Create chat engine instance with llm config from request
    const llm = new OpenAI(modelConfig);
    const chatEngine = await Settings.withLLM(llm, async () => {
      return await createChatEngine({ datasource });
    });

    let annotations = userMessage.annotations;
    if (!annotations) {
      // the user didn't send any new annotations with the last message
      // so use the annotations from the last user message that has annotations
      // REASON: GPT4 doesn't consider MessageContentDetail from previous messages, only strings
      annotations = messages
        .slice()
        .reverse()
        .find(
          (message) => message.role === "user" && message.annotations,
        )?.annotations;
    }

    // Convert message content from Vercel/AI format to LlamaIndex/OpenAI format
    const userMessageContent = convertMessageContent(
      userMessage.content,
      annotations,
    );

    // Setup callbacks
    const callbackManager = createCallbackManager(vercelStreamData);

    // Append context messages to the top of the chat history
    const chatMessages = context.concat(messages) as ChatMessage[];
    const chatHistory = modelConfig.sendMemory
      ? new SummaryChatHistory({ messages: chatMessages, llm })
      : new SimpleChatHistory({ messages: chatMessages });

    // Calling LlamaIndex's ChatEngine to get a streamed response
    const response = await Settings.withCallbackManager(callbackManager, () => {
      return chatEngine.chat({
        message: userMessageContent,
        chatHistory,
        stream: true,
      });
    });

    // Transform LlamaIndex stream to Vercel/AI format
    const stream = LlamaIndexStream(response, vercelStreamData);

    // Return a StreamingTextResponse, which can be consumed by the Vercel/AI client
    return new StreamingTextResponse(stream, {}, vercelStreamData);
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return NextResponse.json(
      {
        detail: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  } finally {
    clearTimeout(streamTimeout);
  }
}
