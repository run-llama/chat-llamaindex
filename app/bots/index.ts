import { Bot } from "../store/bot";

import bots from "./bots.json";

import { type BuiltinBot } from "./typing";
export { type BuiltinBot } from "./typing";

import Locale from "../locales";

export const BUILTIN_BOT_ID = 100000;

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
      builtin: true,
      botHello: Locale.Store.BotHello,
    };
    this.bots[bot.id] = bot;
    return bot;
  },
  getDefault(): Bot {
    return this.bots[BUILTIN_BOT_ID] as Bot;
  },
};

export const BUILTIN_BOTS: BuiltinBot[] = bots.map((m: any) =>
  BUILTIN_BOT_STORE.add(m),
);
