import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUILTIN_BOTS } from "../bots";
import Locale, { getLang, Lang } from "../locales";
import { ChatMessage } from "./session";
import { ModelConfig, useAppConfig } from "./config";
import { nanoid } from "nanoid";
import { Deployment } from "./deployment";

export type Share = {
  id: string;
};

export type Bot = {
  id: string;
  createdAt: number;
  avatar: string;
  name: string;
  hideContext: boolean;
  context: ChatMessage[];
  modelConfig: ModelConfig;
  lang: Lang;
  builtin: boolean;
  deployment: Deployment | null;
  share: Share | null;
  botHello: string | null;
};

export const DEFAULT_BOT_STATE = {
  bots: {} as Record<string, Bot>,
};

export type BotState = typeof DEFAULT_BOT_STATE;
type BotStore = BotState & {
  restore: (state: BotState) => void;
  backup: () => BotState;
  create: (
    bot?: Partial<Bot>,
    options?: { readOnly?: boolean; reset?: boolean },
  ) => Bot;
  update: (id: string, updater: (bot: Bot) => void) => void;
  delete: (id: string) => void;
  search: (text: string) => Bot[];
  get: (id?: string) => Bot | null;
  getAll: () => Bot[];
  getByShareId: (shareId: string) => Bot | null;
};

export const DEFAULT_BOT_AVATAR = "gpt-bot";
export const DEFAULT_BOT_NAME = Locale.Store.DefaultBotName;
export const createEmptyBot = () =>
  ({
    id: nanoid(),
    avatar: DEFAULT_BOT_AVATAR,
    name: DEFAULT_BOT_NAME,
    context: [],
    modelConfig: { ...useAppConfig.getState().modelConfig },
    lang: getLang(),
    builtin: false,
    createdAt: Date.now(),
    deployment: null,
    share: null,
    botHello: Locale.Store.BotHello,
    hideContext: false,
  }) as Bot;

export const useBotStore = create<BotStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_BOT_STATE,

      restore(state: BotState) {
        if (!state.bots) {
          throw new Error("no state object");
        }
        set(() => ({ bots: state.bots }));
      },
      backup() {
        return get();
      },
      create(bot, options) {
        const bots = get().bots;
        const id = nanoid();
        bots[id] = {
          ...createEmptyBot(),
          ...bot,
          id,
          builtin: options?.readOnly || false,
        };
        if (options?.reset) {
          bots[id].share = null;
          bots[id].deployment = null;
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

      getByShareId(shareId) {
        const bots = Object.values(get().bots).filter(
          (v) => shareId === v.share?.id,
        );
        return bots.length === 0 ? null : bots[0];
      },
      get(id) {
        return get().bots[id ?? 1145141919810];
      },
      getAll() {
        const userBots = Object.values(get().bots).sort(
          (a, b) => b.createdAt - a.createdAt,
        );
        const config = useAppConfig.getState();
        const buildinBots = BUILTIN_BOTS.map(
          (m) =>
            ({
              ...m,
              modelConfig: {
                ...config.modelConfig,
                ...m.modelConfig,
              },
            }) as Bot,
        );
        return userBots.concat(buildinBots);
      },
      search(text) {
        return Object.values(get().bots);
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
