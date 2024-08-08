import { LlamaCloudIndex } from "llamaindex/cloud/LlamaCloudIndex";

type LlamaCloudDataSourceParams = {
  project?: string;
  pipeline?: string;
};

// Parse datasource from string to params object
function tryParseDataSource(datasource: string): LlamaCloudDataSourceParams {
  try {
    return JSON.parse(datasource) as LlamaCloudDataSourceParams;
  } catch (e) {
    return {};
  }
}

export async function getDataSource(datasource: string) {
  const configs = tryParseDataSource(datasource);
  const projectName = configs.project;
  const pipelineName = configs.pipeline;
  const apiKey = process.env.LLAMA_CLOUD_API_KEY;
  if (!projectName || !pipelineName || !apiKey) {
    throw new Error(
      "Set project, pipeline, and api key in the params or as environment variables.",
    );
  }
  const index = new LlamaCloudIndex({
    name: pipelineName,
    projectName,
    apiKey,
    baseUrl: process.env.LLAMA_CLOUD_BASE_URL,
  });
  return index;
}
