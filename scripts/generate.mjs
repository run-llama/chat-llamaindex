import {
  serviceContextFromDefaults,
  storageContextFromDefaults,
  SimpleDirectoryReader,
  VectorStoreIndex,
} from "llamaindex";

import {
  DATASOURCES,
  DATASOURCES_CACHE_DIR,
  DATASOURCES_DIR,
  DATASOURCES_CHUNK_SIZE,
  DATASOURCES_CHUNK_OVERLAP,
} from "./constants.mjs";

async function getRuntime(func) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

async function generateDatasource(serviceContext, datasource) {
  console.log(`Generating storage context for datasource '${datasource}'...`);
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
    `Storage context for datasource '${datasource}' successfully generated in ${
      ms / 1000
    }s.`,
  );
}

(async () => {
  const serviceContext = serviceContextFromDefaults({
    chunkSize: DATASOURCES_CHUNK_SIZE,
    chunkOverlap: DATASOURCES_CHUNK_OVERLAP,
  });

  for (const datasource of DATASOURCES) {
    await generateDatasource(serviceContext, datasource);
  }
  console.log("Finished generating datasources");
})();
