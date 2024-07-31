import {
  loadDocuments,
  saveDocument,
} from "@/cl/app/api/chat/llamaindex/documents/helper";
import { getDataSource } from "../engine";
import { runPipeline } from "./pipeline";

export async function uploadDocument(
  raw: string,
  datasource: string,
): Promise<string[]> {
  const [header, content] = raw.split(",");
  const mimeType = header.replace("data:", "").replace(";base64", "");
  const fileBuffer = Buffer.from(content, "base64");
  const documents = await loadDocuments(fileBuffer, mimeType);
  const { filename } = await saveDocument(fileBuffer, mimeType);
  const index = await getDataSource(datasource);
  return await runPipeline(index, documents, filename);
}
