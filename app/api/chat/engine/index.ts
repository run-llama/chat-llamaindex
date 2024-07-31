import { SimpleDocumentStore, VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";
import { STORAGE_CACHE_DIR } from "./shared";

export async function getDataSource(datasource: string) {
  console.log(`Using datasource: ${datasource}`);
  const storageContext = await storageContextFromDefaults({
    persistDir: `${STORAGE_CACHE_DIR}/${datasource}`,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    // create a new index with empty nodes if no datasource found
    return await VectorStoreIndex.init({
      storageContext,
      nodes: [],
    });
  }
  return await VectorStoreIndex.init({
    storageContext,
  });
}
