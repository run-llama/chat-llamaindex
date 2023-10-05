import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BUILTIN_BOT_STORE } from "../bots/index";
import { StoreKey } from "../constant";
import { FileWrap } from "../utils/file";
import { Bot } from "./bot";
import { useAppConfig } from "./config";
import { ChatSession, callSession, createEmptySession } from "./session";

interface ChatStore {
  sessions: ChatSession[];
  currentSessionIndex: number;
  clearSessions: () => void;
  moveSession: (from: number, to: number) => void;
  selectSession: (index: number) => void;
  ensureSession: (bot: Bot) => void;
  currentSession: () => ChatSession;
  nextSession: (delta: number) => void;
  onUserInput: (input: string | FileWrap) => Promise<void>;
  updateCurrentSession: (updater: (session: ChatSession) => void) => void;
  resetSession: () => void;

  clearAllData: () => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      currentSessionIndex: -1,
      globalId: 0,

      clearSessions() {
        set(() => ({
          sessions: [],
          currentSessionIndex: -1,
        }));
      },

      selectSession(index: number) {
        set({
          currentSessionIndex: index,
        });
      },

      moveSession(from: number, to: number) {
        set((state) => {
          const { sessions, currentSessionIndex: oldIndex } = state;

          // move the session
          const newSessions = [...sessions];
          const session = newSessions[from];
          newSessions.splice(from, 1);
          newSessions.splice(to, 0, session);

          // modify current session id
          let newIndex = oldIndex === from ? to : oldIndex;
          if (oldIndex > from && oldIndex <= to) {
            newIndex -= 1;
          } else if (oldIndex < from && oldIndex >= to) {
            newIndex += 1;
          }

          return {
            currentSessionIndex: newIndex,
            sessions: newSessions,
          };
        });
      },

      ensureSession(bot) {
        // TODO: better use a hash for lookup the session by bot id
        let index = get().sessions.findIndex(
          (session) => session.id === bot.id,
        );
        if (index === -1) {
          // session for this bot doesn't exist yet, add it
          const session = createEmptySession();
          session.id = bot.id;
          index = 0;
          set((state) => ({
            sessions: [session].concat(state.sessions),
          }));
        }
        set(() => ({
          currentSessionIndex: index,
        }));
        const session = get().sessions[index];

        const config = useAppConfig.getState();
        const globalModelConfig = config.modelConfig;

        session.bot = {
          ...bot,
          modelConfig: {
            ...globalModelConfig,
            ...bot.modelConfig,
          },
        };
      },

      nextSession(delta) {
        const n = get().sessions.length;
        const limit = (x: number) => (x + n) % n;
        const i = get().currentSessionIndex;
        get().selectSession(limit(i + delta));
      },

      currentSession() {
        const sessions = get().sessions;
        if (sessions.length === 0) {
          this.ensureSession(BUILTIN_BOT_STORE.getDefault());
          return this.currentSession();
        }

        let index = get().currentSessionIndex;
        if (index < 0 || index >= sessions.length) {
          index = Math.min(sessions.length - 1, Math.max(0, index));
          set(() => ({ currentSessionIndex: index }));
        }

        const session = sessions[index];

        return session;
      },

      async onUserInput(input) {
        const inputContent = input instanceof FileWrap ? input.name : input;
        const session = get().currentSession();
        await callSession(
          session,
          inputContent,
          {
            onUpdateMessages: (messages) => {
              get().updateCurrentSession((session) => {
                // trigger re-render of messages
                session.messages = messages;
              });
            },
          },
          input instanceof FileWrap ? input : undefined,
        );
      },

      resetSession() {
        get().updateCurrentSession((session) => {
          session.messages = [];
          session.memoryPrompt = "";
        });
      },

      updateCurrentSession(updater) {
        const sessions = get().sessions;
        const index = get().currentSessionIndex;
        updater(sessions[index]);
        set(() => ({ sessions }));
      },

      clearAllData() {
        localStorage.clear();
        location.reload();
      },
    }),
    {
      name: StoreKey.Chat,
      version: 3.2,
      migrate(persistedState, version) {
        const state = persistedState as any;
        const newState = JSON.parse(JSON.stringify(state)) as ChatStore;

        if (version < 3.2) {
          newState.sessions.forEach((s) => {
            if (!s.bot) {
              s.bot = (s as any).mask;
            }
          });
        }

        return newState;
      },
    },
  ),
);
