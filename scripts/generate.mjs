import {
  serviceContextFromDefaults,
  storageContextFromDefaults,
  SimpleDirectoryReader,
  VectorStoreIndex,
} from "llamaindex";

import {
  DATASOURCES_CACHE_DIR,
  DATASOURCES_DIR,
  DATASOURCES_CHUNK_SIZE,
  DATASOURCES_CHUNK_OVERLAP,
} from "./constants.mjs";
import { exit } from "process";

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

const datasource = process.argv[2];

if (!datasource) {
  console.log("Error: You must provide a datasource as the parameter.");
  console.log("Usage: pnpm run generate <datasource>");
  exit(1);
}

(async () => {
  const serviceContext = serviceContextFromDefaults({
    chunkSize: DATASOURCES_CHUNK_SIZE,
    chunkOverlap: DATASOURCES_CHUNK_OVERLAP,
  });

  await generateDatasource(serviceContext, datasource);
  console.log("Finished generating datasource.");
})();
