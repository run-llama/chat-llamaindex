import { VectorStoreIndex } from "llamaindex";
import { MilvusVectorStore } from "llamaindex/storage/vectorStore/MilvusVectorStore";
import { checkRequiredEnvVars, getMilvusClient } from "./shared";

export async function getDataSource(datasource: string) {
  checkRequiredEnvVars();
  const milvusClient = getMilvusClient();
  const isCollectionExist = await milvusClient.hasCollection({
    collection_name: datasource,
  });

  if (!isCollectionExist.value) {
    throw new Error(
      `Collection "${datasource}" not found. Run "pnpm run generate ${datasource}" to create it.`,
    );
  }
  const store = new MilvusVectorStore({
    milvusClient,
    collection: datasource,
  });
  return await VectorStoreIndex.fromVectorStore(store);
}
