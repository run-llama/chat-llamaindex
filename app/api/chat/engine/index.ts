import { VectorStoreIndex } from "llamaindex";
import { MilvusVectorStore } from "llamaindex/storage/vectorStore/MilvusVectorStore";
import { checkRequiredEnvVars, getMilvusClient } from "./shared";

export async function getDataSource(
  datasource: string,
  createIfNotExists = false,
) {
  checkRequiredEnvVars();
  const milvusClient = getMilvusClient();

  const store = new MilvusVectorStore({
    milvusClient,
    collection: datasource,
  });

  const isCollectionExist = await milvusClient.hasCollection({
    collection_name: datasource,
  });
  if (!isCollectionExist.value) {
    if (createIfNotExists) {
      // TODO: make ensureCollection inside MilvusVectorStore public and use it here
    } else {
      throw new Error(
        `Collection "${datasource}" not found. Run "pnpm run generate ${datasource}" to create it.`,
      );
    }
  }

  return await VectorStoreIndex.fromVectorStore(store);
}
