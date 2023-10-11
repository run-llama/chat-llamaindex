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
  const storageContext = await storageContextFromDefaults({
    persistDir: `./cache/${datasource}`,
  });

  const numberOfDocs = Object.keys(
    (storageContext.docStore as SimpleDocumentStore).toDict(),
  ).length;
  if (numberOfDocs === 0) {
    console.log("[Llama] loading datasource: ", datasource);
    const documents = await new SimpleDirectoryReader().loadData({
      directoryPath: `./datasources/${datasource}`,
    });
    return await VectorStoreIndex.fromDocuments(documents, {
      storageContext,
      serviceContext,
    });
  }
  return await VectorStoreIndex.init({
    storageContext,
    serviceContext,
  });
}
