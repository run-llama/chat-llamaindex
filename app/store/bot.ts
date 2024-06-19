import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  DEMO_BOTS,
  createDemoBots,
  createEmptyBot,
  createEmptySession,
} from "./bot.data";
import { Message } from "ai";

export const MESSAGE_ROLES: Message["role"][] = [
  "system",
  "user",
  "assistant",
  "function",
  "data",
  "tool",
];

export const ALL_MODELS = [
  "gpt-3.5-turbo",
  "gpt-4-1106-preview",
  "gpt-4-vision-preview",
  "gpt-4-turbo",
  "gpt-4o",
] as const;

export type ModelType = (typeof ALL_MODELS)[number];

export interface LLMConfig {
  model: ModelType;
  temperature?: number;
  topP?: number;
  sendMemory?: boolean;
  maxTokens?: number;
}

export interface ChatSession {
  messages: Message[];
}

export type Share = {
  id: string;
};

export type Bot = {
  id: string;
  avatar: string;
  name: string;
  hideContext: boolean;
  context: Message[];
  modelConfig: LLMConfig;
  readOnly: boolean;
  botHello: string | null;
  datasource?: string;
  share?: Share;
  createdAt?: number;
  session: ChatSession;
};

type BotState = {
  bots: Record<string, Bot>;
  currentBotId: string;
};

type BotStore = BotState & {
  currentBot: () => Bot;
  selectBot: (id: string) => void;
  currentSession: () => ChatSession;
  updateBotSession: (
    updater: (session: ChatSession) => void,
    botId: string,
  ) => void;
  get: (id: string) => Bot | undefined;
  getByShareId: (shareId: string) => Bot | undefined;
  getAll: () => Bot[];
  create: (
    bot?: Partial<Bot>,
    options?: { readOnly?: boolean; reset?: boolean },
  ) => Bot;
  update: (id: string, updater: (bot: Bot) => void) => void;
  delete: (id: string) => void;
  restore: (state: BotState) => void;
  backup: () => BotState;
  clearAllData: () => void;
};

const demoBots = createDemoBots();

export const useBotStore = create<BotStore>()(
  persist(
    (set, get) => ({
      bots: demoBots,
      currentBotId: Object.values(demoBots)[0].id,

      currentBot() {
        return get().bots[get().currentBotId];
      },
      selectBot(id) {
        set(() => ({ currentBotId: id }));
      },
      currentSession() {
        return get().currentBot().session;
      },
      updateBotSession(updater, botId) {
        const bots = get().bots;
        updater(bots[botId].session);
        set(() => ({ bots }));
      },
      get(id) {
        return get().bots[id] || undefined;
      },
      getAll() {
        const list = Object.values(get().bots).map((b) => ({
          ...b,
          createdAt: b.createdAt || 0,
        }));
        return list.sort((a, b) => b.createdAt - a.createdAt);
      },
      getByShareId(shareId) {
        return get()
          .getAll()
          .find((b) => shareId === b.share?.id);
      },
      create(bot, options) {
        const bots = get().bots;
        const id = nanoid();
        const session = createEmptySession();
        bots[id] = {
          ...createEmptyBot(),
          ...bot,
          id,
          session,
          readOnly: options?.readOnly || false,
        };
        if (options?.reset) {
          bots[id].share = undefined;
        }
        set(() => ({ bots }));
        return bots[id];
      },
      update(id, updater) {
        const bots = get().bots;
        const bot = bots[id];
        if (!bot) return;
        const updateBot = { ...bot };
        updater(updateBot);
        bots[id] = updateBot;
        set(() => ({ bots }));
      },
      delete(id) {
        const bots = JSON.parse(JSON.stringify(get().bots));
        delete bots[id];

        let nextId = get().currentBotId;
        if (nextId === id) {
          nextId = Object.keys(bots)[0];
        }
        set(() => ({ bots, currentBotId: nextId }));
      },

      backup() {
        return get();
      },
      restore(state: BotState) {
        if (!state.bots) {
          throw new Error("no state object");
        }
        set(() => ({ bots: state.bots }));
      },
      clearAllData() {
        localStorage.clear();
        location.reload();
      },
    }),
    {
      name: "bot-store",
      version: 1,
      migrate: (persistedState, version) => {
        const state = persistedState as BotState;
        if (version < 1) {
          DEMO_BOTS.forEach((demoBot) => {
            // check if there is a bot with the same name as the demo bot
            const bot = Object.values(state.bots).find(
              (b) => b.name === demoBot.name,
            );
            if (bot) {
              // if so, update the id of the bot to the demo bot id
              delete state.bots[bot.id];
              bot.id = demoBot.id;
              state.bots[bot.id] = bot;
            } else {
              // if not, store the new demo bot
              const bot: Bot = JSON.parse(JSON.stringify(demoBot));
              bot.session = createEmptySession();
              state.bots[bot.id] = bot;
            }
          });
          state.currentBotId = Object.values(state.bots)[0].id;
        }
        return state as any;
      },
    },
  ),
);
