import logging
import os
from fastapi import HTTPException, status

from llama_index import (
    StorageContext,
    load_index_from_storage,
    ServiceContext,
)

from app.constants import DATASOURCES_CACHE_DIR


def get_index(service_context: ServiceContext, datasource: str):
    logger = logging.getLogger("uvicorn")
    ds_storage_dir = DATASOURCES_CACHE_DIR + "/" + datasource
    # check if storage already exists
    if not os.path.exists(ds_storage_dir):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Storage for datasource '{datasource}' is empty - make sure to generate the datasource first",
        )
    else:
        # load the existing index
        logger.info(f"Loading index from {ds_storage_dir}...")
        storage_context = StorageContext.from_defaults(persist_dir=ds_storage_dir)
        index = load_index_from_storage(
            storage_context, service_context=service_context
        )
        logger.info(f"Finished loading index from {ds_storage_dir}")
    return index
