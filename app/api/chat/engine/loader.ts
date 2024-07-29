import {
  FILE_EXT_TO_READER,
  SimpleDirectoryReader,
} from "llamaindex/readers/SimpleDirectoryReader";

export const DATA_DIR = "./datasources";

export async function getDocuments(datasource: string) {
  return await new SimpleDirectoryReader().loadData({
    directoryPath: `${DATA_DIR}/${datasource}`,
  });
}

export function getExtractors() {
  return FILE_EXT_TO_READER;
}
