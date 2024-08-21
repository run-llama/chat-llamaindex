import { ContextChatEngine, Settings } from "llamaindex";
import { getDataSource, LlamaCloudDataSourceParams } from "./index";
import { generateFilters } from "@/cl/app/api/chat/engine/queryFilter";

interface ChatEngineOptions {
  datasource: LlamaCloudDataSourceParams;
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
    filters: generateFilters(documentIds || []) as any,
  });
  return new ContextChatEngine({
    chatModel: Settings.llm,
    retriever,
  });
}
