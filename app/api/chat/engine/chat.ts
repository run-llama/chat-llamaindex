import { ContextChatEngine, Settings } from "llamaindex";
import { getDataSource } from "./index";

interface ChatEngineOptions {
  datasource?: string;
  documentIds?: string[];
}

export async function createChatEngine({
  datasource,
  documentIds,
}: ChatEngineOptions) {
  if (!datasource) {
    throw new Error(
      "Datasource is required to create a chat engine. Please provide a datasource name.",
    );
  }

  const index = await getDataSource(datasource);
  const retriever = index.asRetriever({
    similarityTopK: process.env.TOP_K ? parseInt(process.env.TOP_K) : 3,
  });
  return new ContextChatEngine({
    chatModel: Settings.llm,
    retriever,
    systemPrompt: process.env.SYSTEM_PROMPT,
  });
}
