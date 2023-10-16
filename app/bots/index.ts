import { Bot } from "../store/bot";

import { BUILTIN_BOTS } from "./bots";
export { BUILTIN_BOTS } from "./bots";

export const BUILTIN_BOT_ID = 100000;

export type BuiltinBot = Omit<Bot, "id" | "deployment" | "share" | "createdAt">;

export const BUILTIN_BOT_STORE = {
  buildinId: BUILTIN_BOT_ID,
  bots: {} as Record<string, BuiltinBot>,
  get(id?: string) {
    if (!id) return undefined;
    return this.bots[id] as Bot | undefined;
  },
  add(m: BuiltinBot) {
    const bot = {
      ...m,
      id: this.buildinId++,
    };
    this.bots[bot.id] = bot;
    return bot;
  },
  getDefault(): Bot {
    return this.bots[BUILTIN_BOT_ID] as Bot;
  },
};

BUILTIN_BOTS.forEach((m: any) => BUILTIN_BOT_STORE.add(m));
