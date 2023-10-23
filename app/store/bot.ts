import { nanoid } from "nanoid";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { LLMConfig } from "../client/platforms/llm";
import { Deployment } from "./deployment";
import { ChatSession, ChatMessage, callSession } from "./session";
import { createDemoBots, createEmptyBot } from "@/app/bots/bot.data";

export type Share = {
  id: string;
};

export type Bot = {
  id: string;
  avatar: string;
  name: string;
  hideContext: boolean;
  context: ChatMessage[];
  modelConfig: LLMConfig;
  readOnly: boolean;
  botHello: string | null;
  datasource?: string;
  deployment?: Deployment;
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
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
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
      updateCurrentSession(updater) {
        const bots = get().bots;
        updater(bots[get().currentBotId].session);
        set(() => ({ bots }));
      },
      get(id) {
        return get().bots[id];
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
        bots[id] = {
          ...createEmptyBot(),
          ...bot,
          id,
          readOnly: options?.readOnly || false,
        };
        if (options?.reset) {
          bots[id].share = undefined;
          bots[id].deployment = undefined;
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
        const bots = get().bots;
        delete bots[id];
        set(() => ({ bots }));
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
      version: 3.1,

      migrate(state, version) {
        const newState = JSON.parse(JSON.stringify(state)) as BotState;

        // migrate bot id to nanoid
        if (version < 3) {
          Object.values(newState.bots).forEach((m) => (m.id = nanoid()));
        }

        if (version < 3.1) {
          const updatedBots: Record<string, Bot> = {};
          Object.values(newState.bots).forEach((m) => {
            updatedBots[m.id] = m;
          });
          newState.bots = updatedBots;
        }

        return newState as any;
      },
    },
  ),
);
