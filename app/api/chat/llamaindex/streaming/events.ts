import { StreamData } from "ai";
import {
  CallbackManager,
  LLamaCloudFileService,
  Metadata,
  MetadataMode,
  NodeWithScore,
  ToolCall,
  ToolOutput,
} from "llamaindex";

export async function appendSourceData(
  data: StreamData,
  sourceNodes?: NodeWithScore<Metadata>[],
) {
  if (!sourceNodes?.length) return;
  try {
    const nodes = await Promise.all(
      sourceNodes.map(async (node) => ({
        metadata: node.node.metadata,
        id: node.node.id_,
        score: node.score ?? null,
        url: await getNodeUrl(node.node.metadata),
        text: node.node.getContent(MetadataMode.NONE),
      })),
    );
    data.appendMessageAnnotation({
      type: "sources",
      data: {
        nodes,
      },
    });
  } catch (error) {
    console.error("Error appending source data:", error);
  }
}

export function appendEventData(data: StreamData, title?: string) {
  if (!title) return;
  data.appendMessageAnnotation({
    type: "events",
    data: {
      title,
    },
  });
}

export function appendToolData(
  data: StreamData,
  toolCall: ToolCall,
  toolOutput: ToolOutput,
) {
  data.appendMessageAnnotation({
    type: "tools",
    data: {
      toolCall: {
        id: toolCall.id,
        name: toolCall.name,
        input: toolCall.input,
      },
      toolOutput: {
        output: toolOutput.output,
        isError: toolOutput.isError,
      },
    },
  });
}

export function createStreamTimeout(stream: StreamData) {
  const timeout = Number(process.env.STREAM_TIMEOUT ?? 1000 * 60 * 5); // default to 5 minutes
  const t = setTimeout(() => {
    appendEventData(stream, `Stream timed out after ${timeout / 1000} seconds`);
    stream.close();
  }, timeout);
  return t;
}

export function createCallbackManager(stream: StreamData) {
  const callbackManager = new CallbackManager();

  callbackManager.on("retrieve-end", (data: any) => {
    const { nodes, query } = data.detail;
    appendSourceData(stream, nodes);
    appendEventData(stream, `Retrieving context for query: '${query}'`);
    appendEventData(
      stream,
      `Retrieved ${nodes.length} sources to use as context for the query`,
    );
  });

  callbackManager.on("llm-tool-call", (event: any) => {
    const { name, input } = event.detail.toolCall;
    const inputString = Object.entries(input)
      .map(([key, value]) => `${key}: ${value}`)
      .join(", ");
    appendEventData(
      stream,
      `Using tool: '${name}' with inputs: '${inputString}'`,
    );
  });

  callbackManager.on("llm-tool-result", (event: any) => {
    const { toolCall, toolResult } = event.detail;
    appendToolData(stream, toolCall, toolResult);
  });

  return callbackManager;
}

async function getNodeUrl(metadata: Metadata) {
  try {
    const fileName = metadata["file_name"];
    const pipelineId = metadata["pipeline_id"];
    if (fileName && pipelineId) {
      // file has been uploaded to LlamaCloud, so we can get the URL from there
      const downloadUrl = await LLamaCloudFileService.getFileUrl(
        pipelineId,
        fileName,
      );
      if (downloadUrl) {
        console.log(`Retrieved documents URL from LlamaCloud: ${downloadUrl}`);
        return downloadUrl;
      }
    }
  } catch (error) {
    console.error("Error retrieving document URL:", error);
  }
  console.warn(
    "Couldn't retrieve document URL from LlamaCloud for node with metadata",
    metadata,
  );
  return null;
}
