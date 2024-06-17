import { BaseToolWithCall, OpenAIAgent, QueryEngineTool } from "llamaindex";
import fs from "node:fs/promises";
import path from "node:path";
import { getDataSource } from "./index";
import { STORAGE_CACHE_DIR } from "./shared";
import { createTools } from "./tools";

interface ChatEngineOptions {
  datasource?: string;
}

export async function createChatEngine({ datasource }: ChatEngineOptions) {
  const tools: BaseToolWithCall[] = [];

  if (datasource) {
    const index = await getDataSource(datasource);
    if (index) {
      tools.push(
        new QueryEngineTool({
          queryEngine: index.asQueryEngine(),
          metadata: {
            name: "data_query_engine",
            description: `A query engine for documents in storage folder: ${STORAGE_CACHE_DIR}`,
          },
        }),
      );
    } else {
      throw new Error(
        `No datasources found in storage cache folder: ${STORAGE_CACHE_DIR}/${datasource}. Run generate it first.`,
      );
    }
  }

  const configFile = path.join("config", "tools.json");
  let toolConfig: any;
  try {
    // add tools from config file if it exists
    toolConfig = JSON.parse(await fs.readFile(configFile, "utf8"));
  } catch (e) {
    console.info(`Could not read ${configFile} file. Using no tools.`);
  }
  if (toolConfig) {
    tools.push(...(await createTools(toolConfig)));
  }

  return new OpenAIAgent({
    tools,
    systemPrompt: process.env.SYSTEM_PROMPT,
  });
}
