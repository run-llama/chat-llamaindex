import { Embedding } from "@/app/client/fetch/url";
import {
  DATASOURCES_CHUNK_OVERLAP,
  DATASOURCES_CHUNK_SIZE,
} from "@/scripts/constants.mjs";
import {
  Document,
  MetadataMode,
  SentenceSplitter,
  SimpleNodeParser,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

export default async function splitAndEmbed(
  document: string,
): Promise<Embedding[]> {
  const nodeParser = new SimpleNodeParser({
    textSplitter: new SentenceSplitter({
      chunkSize: DATASOURCES_CHUNK_SIZE,
      chunkOverlap: DATASOURCES_CHUNK_OVERLAP,
    }),
  });
  const nodes = nodeParser.getNodesFromDocuments([
    new Document({ text: document }),
  ]);
  const index = await VectorStoreIndex.fromDocuments(nodes, {
    serviceContext: serviceContextFromDefaults(),
  });
  const nodesWithEmbeddings = await index.getNodeEmbeddingResults(nodes);

  return nodesWithEmbeddings.map((nodeWithEmbedding) => ({
    text: nodeWithEmbedding.getContent(MetadataMode.NONE),
    embedding: nodeWithEmbedding.getEmbedding(),
  }));
}
