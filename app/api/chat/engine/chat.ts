import { ContextChatEngine, Settings, SimpleChatEngine } from "llamaindex";
import { getDataSource } from "./index";
import { STORAGE_CACHE_DIR } from "./shared";

interface ChatEngineOptions {
  datasource?: string;
}

export async function createChatEngine({ datasource }: ChatEngineOptions) {
  if (datasource) {
    const index = await getDataSource(datasource);
    if (!index) {
      throw new Error(
        `No datasources found in storage cache folder: ${STORAGE_CACHE_DIR}/${datasource}. Run generate it first.`,
      );
    }
    const retriever = index.asRetriever({
      similarityTopK: process.env.TOP_K ? parseInt(process.env.TOP_K) : 3,
    });
    return new ContextChatEngine({
      chatModel: Settings.llm,
      retriever,
      systemPrompt: process.env.SYSTEM_PROMPT,
    });
  }

  return new SimpleChatEngine({
    llm: Settings.llm,
  });
}
