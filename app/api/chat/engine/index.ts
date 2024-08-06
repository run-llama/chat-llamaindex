import { VectorStoreIndex } from "llamaindex";
import { MilvusVectorStore } from "llamaindex/storage/vectorStore/MilvusVectorStore";
import {
  checkRequiredEnvVars,
  getMilvusClient,
} from "@/cl/app/api/chat/engine/shared";

const checkColllectionExist = async (collection: string) => {
  const milvusClient = getMilvusClient();
  const isCollectionExist = await milvusClient.hasCollection({
    collection_name: collection,
  });
  return isCollectionExist.value;
};

export async function getDataSource(datasource: string) {
  console.log(`Using datasource: ${datasource}`);
  checkRequiredEnvVars({ checkCollectionEnv: false }); // Do not check for collection env var
  const milvusClient = getMilvusClient();

  // remove this code if you don't want to check collection existence before creating the index
  // Milvus can automatically create the collection if it does not exist
  if (!(await checkColllectionExist(datasource))) {
    throw new Error(`Collection "${datasource}" does not exist`);
  }

  const store = new MilvusVectorStore({ milvusClient, collection: datasource });
  return await VectorStoreIndex.fromVectorStore(store);
}
