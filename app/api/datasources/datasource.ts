import { DATASOURCES_CACHE_DIR, DATASOURCES_DIR } from "@/app/constant";
import { getRuntime } from "@/app/utils/runtime";

import {
  VectorStoreIndex,
  SimpleDirectoryReader,
  storageContextFromDefaults,
  ServiceContext,
  SimpleDocumentStore,
} from "llamaindex";

export async function getDataSource(
  serviceContext: ServiceContext,
  datasource: string,
) {
  let storageContext = await storageContextFromDefaults({
    persistDir: `${DATASOURCES_CACHE_DIR}/${datasource}`,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    throw new Error(
      `StorageContext for datasource '${datasource}' is empty - make sure to generate the datasource first`,
    );
  }
  return await VectorStoreIndex.init({
    storageContext,
    serviceContext,
  });
}

export async function generateDatasource(
  serviceContext: ServiceContext,
  datasource: string,
): Promise<void> {
  console.log(
    `[Datasources] Generating storage context for datasource '${datasource}'...`,
  );
  // Split documents, create embeddings and store them in the storage context
  const ms = await getRuntime(async () => {
    const storageContext = await storageContextFromDefaults({
      persistDir: `${DATASOURCES_CACHE_DIR}/${datasource}`,
    });
    const documents = await new SimpleDirectoryReader().loadData({
      directoryPath: `${DATASOURCES_DIR}/${datasource}`,
    });
    await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
      serviceContext,
    });
  });
  console.log(
    `[Datasources] Storage context for datasource '${datasource}' successfully generated in ${
      ms / 1000
    }s.`,
  );
}
