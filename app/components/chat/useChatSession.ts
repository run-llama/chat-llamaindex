"use client";

import { useBotStore } from "@/app/store/bot";
import { useChat } from "ai/react";
import { useCallback, useEffect, useState } from "react";
import { useClientConfig } from "@/cl/app/components/ui/chat/hooks/use-config";

// Combine useChat and useBotStore to manage chat session
export function useChatSession() {
  const botStore = useBotStore();
  const bot = botStore.currentBot();
  const session = botStore.currentSession();
  const { updateBotSession } = botStore;

  const [isFinished, setIsFinished] = useState(false);
  const { chatAPI } = useClientConfig();
  const {
    messages,
    setMessages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
    append,
    setInput,
  } = useChat({
    api: chatAPI,
    headers: {
      "Content-Type": "application/json", // using JSON because of vercel/ai 2.2.26
    },
    body: {
      context: bot.context,
      modelConfig: bot.modelConfig,
      datasource: bot.datasource,
    },
    onError: (error: unknown) => {
      if (!(error instanceof Error)) throw error;
      const message = JSON.parse(error.message);
      alert(message.detail);
    },
    onFinish: () => setIsFinished(true),
  });

  // load chat history from session when component mounts
  const loadChatHistory = useCallback(() => {
    setMessages(session.messages);
  }, [session, setMessages]);

  // sync chat history with bot session when finishing streaming
  const syncChatHistory = useCallback(() => {
    if (messages.length === 0) return;
    updateBotSession((session) => (session.messages = messages), bot.id);
  }, [messages, updateBotSession, bot.id]);

  useEffect(() => {
    loadChatHistory();
  }, [loadChatHistory]);

  useEffect(() => {
    if (isFinished) {
      syncChatHistory();
      setIsFinished(false);
    }
  }, [isFinished, setIsFinished, syncChatHistory]);

  return {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
    append,
    setInput,
  };
}
