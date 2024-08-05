"use client";

import { useBotStore } from "@/app/store/bot";
import { useChatSession } from "./useChatSession";
import { ChatMessages, ChatInput } from "@/cl/app/components/ui/chat";

// Custom ChatSection for ChatLlamaindex
export default function ChatSection() {
  const {
    messages,
    input,
    isLoading,
    handleSubmit,
    handleInputChange,
    reload,
    stop,
    append,
    setInput,
  } = useChatSession();
  const botStore = useBotStore();
  const bot = botStore.currentBot();
  return (
    <div className="space-y-4 w-full h-full flex flex-col">
      <ChatMessages
        messages={messages}
        isLoading={isLoading}
        reload={reload}
        stop={stop}
        append={append}
      />
      <ChatInput
        input={input}
        handleSubmit={handleSubmit}
        handleInputChange={handleInputChange}
        isLoading={isLoading}
        messages={messages}
        append={append}
        setInput={setInput}
        requestParams={{ datasource: bot.datasource }}
        onFileError={(errMsg) => alert(errMsg)}
      />
    </div>
  );
}
