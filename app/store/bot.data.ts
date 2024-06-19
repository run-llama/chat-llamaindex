import { Bot, ChatSession } from "@/app/store/bot";
import { nanoid } from "nanoid";
import Locale from "../locales";

const TEMPLATE = (PERSONA: string) =>
  `I want you to act as a ${PERSONA}. I will provide you with the context needed to solve my problem. Use intelligent, simple, and understandable language. Be concise. It is helpful to explain your thoughts step by step and with bullet points.`;

type DemoBot = Omit<Bot, "session">;

export const DEMO_BOTS: DemoBot[] = [
  {
    id: "2",
    avatar: "1f916",
    name: "My Documents",
    botHello: "Hello! How can I assist you today?",
    context: [],
    modelConfig: {
      model: "gpt-3.5-turbo",
      temperature: 0.5,
      maxTokens: 4096,
      sendMemory: false,
    },
    readOnly: true,
  },
  {
    id: "3",
    avatar: "1f5a5-fe0f",
    name: "Red Hat Linux Expert",
    botHello: "Hello! How can I help you with Red Hat Linux?",
    context: [
      {
        role: "system",
        content: TEMPLATE("Red Hat Linux Expert"),
        id: "demo-bot-3-system-message",
      },
    ],
    modelConfig: {
      model: "gpt-3.5-turbo",
      temperature: 0.1,
      maxTokens: 4096,
      sendMemory: false,
    },
    readOnly: true,
    datasource: "redhat",
  },
  {
    id: "4",
    avatar: "1f454",
    name: "Apple Watch Genius",
    botHello: "Hello! How can I help you with Apple Watches?",
    context: [
      {
        role: "system",
        content: TEMPLATE("Apple Genius specialized in Apple Watches"),
        id: "demo-bot-4-system-message",
      },
    ],
    modelConfig: {
      model: "gpt-3.5-turbo",
      temperature: 0.1,
      maxTokens: 4096,
      sendMemory: false,
    },
    readOnly: true,
    datasource: "watchos",
  },
  {
    id: "5",
    avatar: "1f4da",
    name: "German Basic Law Expert",
    botHello: "Hello! How can I assist you today?",
    context: [
      {
        role: "system",
        content: TEMPLATE("Lawyer specialized in the basic law of Germany"),
        id: "demo-bot-5-system-message",
      },
    ],
    modelConfig: {
      model: "gpt-3.5-turbo",
      temperature: 0.1,
      maxTokens: 4096,
      sendMemory: false,
    },
    readOnly: true,
    datasource: "basic_law_germany",
  },
];

export const createDemoBots = (): Record<string, Bot> => {
  const map: Record<string, Bot> = {};
  DEMO_BOTS.forEach((demoBot) => {
    const bot: Bot = JSON.parse(JSON.stringify(demoBot));
    bot.session = createEmptySession();
    map[bot.id] = bot;
  });
  return map;
};

export const createEmptyBot = (): Bot => ({
  id: nanoid(),
  avatar: "1f916",
  name: Locale.Store.DefaultBotName,
  context: [],
  modelConfig: {
    model: "gpt-3.5-turbo",
    temperature: 0.5,
    maxTokens: 4096,
    sendMemory: false,
  },
  readOnly: false,
  createdAt: Date.now(),
  botHello: Locale.Store.BotHello,
  session: createEmptySession(),
});

export function createEmptySession(): ChatSession {
  return {
    messages: [],
  };
}
