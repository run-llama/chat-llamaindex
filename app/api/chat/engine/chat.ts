import { ContextChatEngine, Settings } from "llamaindex";
import { getDataSource } from "./index";
import { generateFilters } from "@/cl/app/api/chat/engine/chat";

interface ChatEngineOptions {
  datasource: string;
  documentIds?: string[];
}

export async function createChatEngine({
  datasource,
  documentIds,
}: ChatEngineOptions) {
  const index = await getDataSource(datasource);
  if (!index) {
    throw new Error(
      `StorageContext is empty - call 'pnpm run generate ${datasource}' to generate the storage first`,
    );
  }
  const retriever = index.asRetriever({
    similarityTopK: process.env.TOP_K ? parseInt(process.env.TOP_K) : 3,
    filters: generateFilters(documentIds || []),
  });
  return new ContextChatEngine({
    chatModel: Settings.llm,
    retriever,
    systemPrompt: process.env.SYSTEM_PROMPT,
  });
}
