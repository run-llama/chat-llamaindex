import {
  BaseToolWithCall,
  OpenAIAgent,
  QueryEngineTool,
  Settings,
  SimpleChatEngine,
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
    return new SimpleChatEngine({
      llm: Settings.llm,
    });
  }

  const index = await getDataSource(datasource);
  const tools: BaseToolWithCall[] = [
    new QueryEngineTool({
      queryEngine: index.asQueryEngine({
        preFilters: undefined,
      }),
      metadata: {
        name: "data_query_engine",
        description: `A query engine for documents from your data source.`,
      },
    }),
  ];

  return new OpenAIAgent({
    tools,
    systemPrompt: process.env.SYSTEM_PROMPT,
  });
}

// function generateFilters(documentIds: string[]): MetadataFilters | undefined {
//   // public documents don't have the "private" field or it's set to "false"
//   const publicDocumentsFilter: MetadataFilter = {
//     key: "private",
//     value: ["true"],
//     operator: "nin",
//   };

//   // if no documentIds are provided, only retrieve information from public documents
//   if (!documentIds.length) return { filters: [publicDocumentsFilter] };

//   const privateDocumentsFilter: MetadataFilter = {
//     key: "doc_id",
//     value: documentIds,
//     operator: "in",
//   };

//   // if documentIds are provided, retrieve information from public and private documents
//   return {
//     filters: [publicDocumentsFilter, privateDocumentsFilter],
//     condition: "or",
//   };
// }
