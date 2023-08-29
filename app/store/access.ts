import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DEFAULT_API_HOST, StoreKey } from "../constant";

export interface AccessControlStore {
  token: string;
  openaiUrl: string;
  disableGPT4: boolean;

  updateToken: (_: string) => void;
  updateOpenAiUrl: (_: string) => void;
}

const DEFAULT_OPENAI_URL = DEFAULT_API_HOST;
console.log("[API] default openai url", DEFAULT_OPENAI_URL);

export const useAccessStore = create<AccessControlStore>()(
  persist(
    (set, get) => ({
      token: "",
      openaiUrl: DEFAULT_OPENAI_URL,
      disableGPT4: false,

      updateToken(token: string) {
        set(() => ({ token: token?.trim() }));
      },
      updateOpenAiUrl(url: string) {
        set(() => ({ openaiUrl: url?.trim() }));
      },
    }),
    {
      name: StoreKey.Access,
      version: 1,
    },
  ),
);
