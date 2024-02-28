import { Embedding } from "@/app/client/fetch/url";
import {
  DATASOURCES_CHUNK_OVERLAP,
  DATASOURCES_CHUNK_SIZE,
} from "@/scripts/constants.mjs";
import {
  Document,
  MetadataMode,
  OpenAIEmbedding,
  SentenceSplitter,
  SimpleNodeParser,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";

export default async function splitAndEmbed(
  document: string,
): Promise<Embedding[]> {
  const embedModel = new OpenAIEmbedding();
  const nodeParser = new SimpleNodeParser({
    chunkSize: DATASOURCES_CHUNK_SIZE,
    chunkOverlap: DATASOURCES_CHUNK_OVERLAP,
  });
  const nodes = nodeParser.getNodesFromDocuments([
    new Document({ text: document }),
  ]);
  const texts = nodes.map((node) => node.getContent(MetadataMode.EMBED));
  const embeddings = await embedModel.getTextEmbeddingsBatch(texts);

  return nodes.map((node, i) => ({
    text: node.getContent(MetadataMode.NONE),
    embedding: embeddings[i],
  }));
}
