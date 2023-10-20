import {
  ParseMode,
  PollUpdate,
  TelegramAPI,
} from "../client/platforms/telegram";
import {
  ChatMessage,
  ChatSession,
  callSession,
  createEmptySession,
} from "../store";
import { Bot } from "../store/bot";

interface State {
  running: boolean;
  lastStatus: Status;
  startData: StartCommandData;
  chats: Record<number, ChatSession>;
}

interface Status {
  status: string;
  error?: string;
}

interface StartCommandData {
  token: string;
  openaiToken: string;
  bot: Bot;
}

interface Command {
  command: string;
  data?: StartCommandData;
}

const ctx: State = self as any;
ctx.running = false;
ctx.chats = {};
const telegram = new TelegramAPI();

function handleBotCommands(
  chatId: number,
  message: string,
): string | undefined {
  const commandResponses: any = {
    "/start": ctx.startData.bot.botHello || "Hello!",
    "/help":
      "/clear - clear context\n/start - show welcome message\n/help - show this message",
    "/clear": () => {
      resetChat(chatId);
      return "Context cleared";
    },
  };

  if (Object.keys(commandResponses).includes(message)) {
    let response = commandResponses[message];
    if (typeof response === "function") {
      response = response();
    }
    return response;
  }
}

async function handleUpdate(update: PollUpdate): Promise<void> {
  const message = update.message;
  if (!message) {
    if (update.my_chat_member) {
      telegram.sendMessage(
        ctx.startData.token,
        update.my_chat_member.chat.id,
        "Sorry I can't talk in a group. Please add me to a private chat.",
      );
    } else {
      console.error("Unknown update type", update);
    }
    return;
  }
  const cmdMessage = handleBotCommands(message.chat.id, message.text);
  if (cmdMessage) {
    telegram.sendMessage(ctx.startData.token, message.chat.id, cmdMessage);
    return;
  }
  const aiMessage = await handleAI(message.chat.id, message.text);
  if (aiMessage) {
    telegram.sendMessage(
      ctx.startData.token,
      message.chat.id,
      aiMessage.content,
      ParseMode.MarkdownV2,
    );
    return;
  }
}

async function handleAI(
  chatId: number,
  text: string,
): Promise<ChatMessage | undefined> {
  const session = getChatSession(chatId);
  return await callSession(ctx.startData.bot, session, text, {
    onUpdateMessages: (newMessages) => {
      session.messages = newMessages;
    },
  });
}

function setStatus(status: Status): void {
  ctx.lastStatus = status;
  self.postMessage(status);
}

function getChatSession(chatId: number): ChatSession {
  if (!ctx.chats[chatId]) {
    resetChat(chatId);
  }
  return ctx.chats[chatId];
}

function resetChat(chatId: number): void {
  ctx.chats[chatId] = createEmptySession();
}

async function start(data: StartCommandData): Promise<void> {
  ctx.startData = data;

  let offset: number | undefined;
  setStatus({ status: "STARTING" });
  ctx.running = true;
  for (let i = 0; ; i++) {
    const result = await telegram.poll(data.token, handleUpdate, offset);
    if (!ctx.running) {
      setStatus({ status: "STOPPED" });
      break;
    }
    if (!result.ok) {
      if (result.error_code === 404) {
        setStatus({ status: "INVALID_TOKEN" });
      } else {
        setStatus({ status: "UNKNOWN", error: result.description });
      }
      break;
    }
    if (result.ok && i == 0) {
      setStatus({ status: "RUNNING" });
    }
    offset = result.newOffset;
  }
  self.close();
}

function stop(): void {
  setStatus({ status: "STOPPING" });
  ctx.running = false;
}

self.onmessage = async function (event: MessageEvent): Promise<void> {
  // get the command from the main thread
  const command: Command = event.data;

  if (command.command === "start") {
    start(command.data!);
  } else if (command.command === "get_status") {
    self.postMessage(ctx.lastStatus);
  } else if (command.command === "stop") {
    stop();
  } else {
    console.error("Unknown command: " + command.command);
  }
};
