import * as dotenv from "dotenv";
import * as fs from "fs/promises";
import * as path from "path";
import { getDataSource } from ".";
import { FilesService, PipelinesService } from "@llamaindex/cloud/api";
import { initService } from "llamaindex/cloud/utils";

const DATA_DIR = "./datasources";

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

// TODO: should be moved to LlamaCloudFileService of LlamaIndexTS
async function addFileToPipeline(
  projectId: string,
  pipelineId: string,
  uploadFile: File | Blob,
  customMetadata: Record<string, any> = {},
) {
  const file = await FilesService.uploadFileApiV1FilesPost({
    projectId,
    formData: {
      upload_file: uploadFile,
    },
  });
  const files = [
    {
      file_id: file.id,
      custom_metadata: { file_id: file.id, ...customMetadata },
    },
  ];
  await PipelinesService.addFilesToPipelineApiV1PipelinesPipelineIdFilesPut({
    pipelineId,
    requestBody: files,
  });
}

async function generateDatasource() {
  const datasource = process.argv[2];
  if (!datasource) {
    console.error("Please provide a datasource as an argument.");
    process.exit(1);
  }

  console.log(`Generating storage context for datasource '${datasource}'...`);

  const ms = await getRuntime(async () => {
    const index = await getDataSource({
      pipeline: datasource,
      ensureIndex: true,
    });
    const projectId = await index.getProjectId();
    const pipelineId = await index.getPipelineId();

    // walk through the data directory and upload each file to LlamaCloud
    for await (const filePath of walk(path.join(DATA_DIR, datasource))) {
      const buffer = await fs.readFile(filePath);
      const filename = path.basename(filePath);
      const file = new File([buffer], filename);
      await addFileToPipeline(projectId, pipelineId, file, {
        private: "false",
      });
    }
  });
  console.log(
    `Successfully uploaded documents to LlamaCloud in ${ms / 1000}s.`,
  );
}

(async () => {
  initService();
  await generateDatasource();
  console.log("Finished generating storage.");
})();
