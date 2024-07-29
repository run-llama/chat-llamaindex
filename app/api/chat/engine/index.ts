import { VectorStoreIndex } from "llamaindex";
import { MilvusVectorStore } from "llamaindex/storage/vectorStore/MilvusVectorStore";
import { checkRequiredEnvVars, getMilvusClient } from "./shared";

export async function getDataSource(collection: string) {
  checkRequiredEnvVars();
  const milvusClient = getMilvusClient();
  const isCollectionExist = await milvusClient.hasCollection({
    collection_name: collection,
  });

  if (!isCollectionExist.value) {
    throw new Error(
      `Collection "${collection}" not found. Run "pnpm run generate ${collection}" to create it.`,
    );
  }
  const store = new MilvusVectorStore({
    milvusClient,
    collection,
  });
  return await VectorStoreIndex.fromVectorStore(store);
}
