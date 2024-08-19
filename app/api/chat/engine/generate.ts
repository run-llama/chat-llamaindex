import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import { LLamaCloudFileService } from "llamaindex";
import * as path from "path";
import { getDataSource } from ".";
import { DATA_DIR } from "./loader";
import { initSettings } from "./settings";

const DEFAULT_LLAMACLOUD_PROJECT = "Default";

// Load environment variables from local .env.development.local file
dotenv.config({ path: ".env.development.local" });

async function getRuntime(func: any) {
  const start = Date.now();
  await func();
  const end = Date.now();
  return end - start;
}

async function* walk(dir: string): AsyncGenerator<string> {
  const directory = await fs.opendir(dir);

  for await (const dirent of directory) {
    const entryPath = path.join(dir, dirent.name);

    if (dirent.isDirectory()) {
      yield* walk(entryPath); // Recursively walk through directories
    } else if (dirent.isFile()) {
      yield entryPath; // Yield file paths
    }
  }
}

async function generateDatasource() {
  const datasource = process.argv[2];
  if (!datasource) {
    console.error("Please provide a datasource as an argument.");
    process.exit(1);
  }

  console.log(`Generating storage context for datasource '${datasource}'...`);
  const ms = await getRuntime(async () => {
    const params = JSON.stringify({
      project:
        process.env.LLAMA_CLOUD_PROJECT_NAME ?? DEFAULT_LLAMACLOUD_PROJECT,
      pipeline: datasource,
    });
    const index = await getDataSource(params);
    const projectId = await index.getProjectId();
    const pipelineId = await index.getPipelineId();

    // walk through the data directory and upload each file to LlamaCloud
    for await (const filePath of walk(path.join(DATA_DIR, datasource))) {
      const buffer = await fs.readFile(filePath);
      const filename = path.basename(filePath);
      const file = new File([buffer], filename);
      await LLamaCloudFileService.addFileToPipeline(
        projectId,
        pipelineId,
        file,
        {
          private: "false",
        },
      );
    }
  });
  console.log(
    `Successfully uploaded documents to LlamaCloud in ${ms / 1000}s.`,
  );
}

(async () => {
  initSettings();
  await generateDatasource();
  console.log("Finished generating storage.");
})();
