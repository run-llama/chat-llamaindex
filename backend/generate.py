import sys
from llama_index import (
    SimpleDirectoryReader,
    VectorStoreIndex,
    ServiceContext,
)
from app.constants import (
    DATASOURCES_CACHE_DIR,
    DATASOURCES_DIR,
    DATASOURCES_CHUNK_SIZE,
    DATASOURCES_CHUNK_OVERLAP,
)


def generateDatasource(service_context: ServiceContext, datasource: str):
    ds_data_dir = DATASOURCES_DIR + "/" + datasource
    ds_storage_dir = DATASOURCES_CACHE_DIR + "/" + datasource
    print(f"Generating storage context for datasource '{datasource}'...")
    # load the documents and create the index
    documents = SimpleDirectoryReader(ds_data_dir).load_data()
    index = VectorStoreIndex.from_documents(
        documents, service_context=service_context, show_progress=True
    )
    # store it for later
    index.storage_context.persist(ds_storage_dir)
    print(f"Finished creating new index. Stored in {ds_storage_dir}")


def main():
    if len(sys.argv) < 2:
        print("Please provide a datasource parameter.")
        return

    datasource = sys.argv[1]
    service_context = ServiceContext.from_defaults(
        chunk_size=DATASOURCES_CHUNK_SIZE, chunk_overlap=DATASOURCES_CHUNK_OVERLAP
    )
    generateDatasource(service_context, datasource)
    print("Finished generating datasource.")


if __name__ == "__main__":
    main()
