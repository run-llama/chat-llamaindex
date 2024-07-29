import {
  MilvusVectorStore,
  VectorStoreIndex,
  storageContextFromDefaults,
} from "llamaindex";

import * as dotenv from "dotenv";

import { getDocuments } from "./loader";
import { initSettings } from "./settings";
import { getMilvusClient } from "./shared";

// Load environment variables from local .env.development.local file
dotenv.config({ path: ".env.development.local" });

async function getRuntime(func: any) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

async function generateDatasource() {
  const datasource = process.argv[2];
  if (!datasource) {
    console.error("Please provide a datasource as an argument.");
    process.exit(1);
  }

  console.log(`Generating storage context for datasource '${datasource}'...`);
  // Split documents, create embeddings and store them in the storage context
  const ms = await getRuntime(async () => {
    const milvusClient = getMilvusClient();
    const vectorStore = new MilvusVectorStore({
      milvusClient,
      collection: datasource,
    });
    const storageContext = await storageContextFromDefaults({ vectorStore });
    const documents = await getDocuments(datasource);
    await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
    });
  });
  console.log(`Storage context successfully generated in ${ms / 1000}s.`);
}

(async () => {
  initSettings();
  await generateDatasource();
  console.log("Finished generating storage.");
})();
