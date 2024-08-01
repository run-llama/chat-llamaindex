import { SimpleDocumentStore, VectorStoreIndex } from "llamaindex";
import { storageContextFromDefaults } from "llamaindex/storage/StorageContext";
import { STORAGE_CACHE_DIR } from "@/cl/app/api/chat/engine/shared";

export async function getDataSource(datasource: string) {
  console.log(`Using datasource: ${datasource}`);
  const storageContext = await storageContextFromDefaults({
    persistDir: `${STORAGE_CACHE_DIR}/${datasource}`,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    throw new Error(
      `StorageContext is empty - call 'pnpm run generate ${datasource}' to generate the storage first`,
    );
  }
  return await VectorStoreIndex.init({
    storageContext,
  });
}
