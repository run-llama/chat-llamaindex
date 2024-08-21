import { LlamaCloudIndex } from "llamaindex/cloud/LlamaCloudIndex";
import type { CloudConstructorParams } from "llamaindex/cloud/constants";

export type LlamaCloudDataSourceParams = {
  project?: string;
  pipeline?: string;
  ensureIndex?: boolean;
};

export function parseDataSource(
  datasource: string,
): LlamaCloudDataSourceParams {
  try {
    return JSON.parse(datasource) as LlamaCloudDataSourceParams;
  } catch (e) {
    return {};
  }
}

export async function getDataSource(params: LlamaCloudDataSourceParams) {
  checkEnvVars();
  if (params.ensureIndex) {
    // ensure that the index exists
    try {
      await LlamaCloudIndex.fromDocuments({
        ...createParams(params),
        documents: [],
      });
    } catch (e) {
      if ((e as any).status === 400) {
        // ignore 400 error, it's caused by calling fromDocuments with empty documents
        // TODO: fix in LLamaIndexTS
      } else {
        throw e;
      }
    }
  }
  return new LlamaCloudIndex(createParams(params));
}

function createParams({
  project,
  pipeline,
}: LlamaCloudDataSourceParams): CloudConstructorParams {
  if (!pipeline) {
    throw new Error("Set pipeline in the params.");
  }
  const params = {
    organizationId: process.env.LLAMA_CLOUD_ORGANIZATION_ID,
    name: pipeline,
    projectName: project ?? process.env.LLAMA_CLOUD_PROJECT_NAME!,
    apiKey: process.env.LLAMA_CLOUD_API_KEY,
    baseUrl: process.env.LLAMA_CLOUD_BASE_URL,
  };
  return params;
}

function checkEnvVars() {
  if (
    !process.env.LLAMA_CLOUD_PROJECT_NAME ||
    !process.env.LLAMA_CLOUD_API_KEY
  ) {
    throw new Error(
      "LLAMA_CLOUD_PROJECT_NAME and LLAMA_CLOUD_API_KEY environment variables must be set.",
    );
  }
}
