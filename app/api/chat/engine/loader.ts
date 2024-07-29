import { SimpleDirectoryReader } from "llamaindex";

export const DATA_DIR = "./datasources";

export async function getDocuments(datasource: string) {
  return await new SimpleDirectoryReader().loadData({
    directoryPath: `${DATA_DIR}/${datasource}`,
  });
}
