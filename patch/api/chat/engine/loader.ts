import { SimpleDirectoryReader } from "llamaindex";

export const DATA_DIR = "./datasources";

export async function getDocuments() {
  return await new SimpleDirectoryReader().loadData({
    directoryPath: DATA_DIR,
  });
}
