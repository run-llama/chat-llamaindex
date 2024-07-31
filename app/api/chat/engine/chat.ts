import {
  ContextChatEngine,
  MetadataFilter,
  MetadataFilters,
  Settings,
} from "llamaindex";
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
    filters: generateFilters(documentIds || []),
  });
  return new ContextChatEngine({
    chatModel: Settings.llm,
    retriever,
    systemPrompt: process.env.SYSTEM_PROMPT,
  });
}

function generateFilters(documentIds: string[]): MetadataFilters {
  // public documents don't have the "private" field or it's set to "false"
  const publicDocumentsFilter: MetadataFilter = {
    key: "private",
    value: ["true"],
    operator: "nin",
  };

  // if no documentIds are provided, only retrieve information from public documents
  if (!documentIds.length) return { filters: [publicDocumentsFilter] };

  const privateDocumentsFilter: MetadataFilter = {
    key: "doc_id",
    value: documentIds,
    operator: "in",
  };

  // if documentIds are provided, retrieve information from public and private documents
  return {
    filters: [publicDocumentsFilter, privateDocumentsFilter],
    condition: "or",
  };
}
