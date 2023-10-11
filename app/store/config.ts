import { create } from "zustand";
import { persist } from "zustand/middleware";

export enum SubmitKey {
  Enter = "Enter",
  CtrlEnter = "Ctrl + Enter",
  ShiftEnter = "Shift + Enter",
  AltEnter = "Alt + Enter",
  MetaEnter = "Meta + Enter",
}

export enum Theme {
  Auto = "auto",
  Dark = "dark",
  Light = "light",
}

export const DEFAULT_CONFIG = {
  submitKey: SubmitKey.Enter as SubmitKey,
  avatar: "1f603",
  fontSize: 14,
  theme: Theme.Light as Theme,

  modelConfig: {
    model: "gpt-3.5-turbo" as ModelType,
    temperature: 0.5,
    topP: 1,
    maxTokens: 2000,
    sendMemory: true,
  },
};

export type ChatConfig = typeof DEFAULT_CONFIG;

export type ChatConfigStore = ChatConfig & {
  reset: () => void;
  update: (updater: (config: ChatConfig) => void) => void;
};

export type ModelConfig = ChatConfig["modelConfig"];

export const ALL_MODELS = [
  {
    name: "gpt-4",
    available: true,
  },
  {
    name: "gpt-4-32k",
    available: true,
  },
  {
    name: "gpt-3.5-turbo",
    available: true,
  },
  {
    name: "gpt-3.5-turbo-16k",
    available: true,
  },
] as const;

export type ModelType = (typeof ALL_MODELS)[number]["name"];

export function limitNumber(
  x: number,
  min: number,
  max: number,
  defaultValue: number,
) {
  if (typeof x !== "number" || isNaN(x)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(min, x));
}

export const ModalConfigValidator = {
  model(x: string) {
    return x as ModelType;
  },
  maxTokens(x: number) {
    return limitNumber(x, 0, 100000, 2000);
  },
  temperature(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
  topP(x: number) {
    return limitNumber(x, 0, 1, 1);
  },
};

export const useAppConfig = create<ChatConfigStore>()(
  persist(
    (set, get) => ({
      ...DEFAULT_CONFIG,

      reset() {
        set(() => ({ ...DEFAULT_CONFIG }));
      },

      update(updater) {
        const config = { ...get() };
        updater(config);
        set(() => config);
      },
    }),
    {
      name: "app-config",
      version: 1,
    },
  ),
);
