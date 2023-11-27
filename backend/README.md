This is a [LlamaIndex](https://www.llamaindex.ai/) project using [FastAPI](https://fastapi.tiangolo.com/) bootstrapped with [`create-llama`](https://github.com/run-llama/LlamaIndexTS/tree/main/packages/create-llama).

## Getting Started

First, setup the environment:

```
poetry install
poetry shell
```

By default, we use the OpenAI LLM (though you can customize, see app/api/routers/chat.py). As a result you need to specify an `OPENAI_API_KEY` in an .env file in this directory.

Example `backend/.env` file:

```
OPENAI_API_KEY=<openai_api_key>
```

Second, run the development server:

```
python main.py
```

Then call the API endpoint `/api/chat` to see the result:

```
curl --location 'localhost:8000/api/chat' \
--header 'Content-Type: application/json' \
--data '{ "message": "Hello" }] }'
```

You can start editing the API by modifying `app/api/routers/chat.py`. The endpoint auto-updates as you save the file.

Open [http://localhost:8000/docs](http://localhost:8000/docs) with your browser to see the Swagger UI of the API.

The API allows CORS for all origins to simplify development. You can change this behavior by setting the `ENVIRONMENT` environment variable to `prod`:

```
ENVIRONMENT=prod uvicorn main:app
```

## 📀 Data Sources

The app is using a `ChatEngine` for each bot with a `VectorStoreIndex` attached.
The `cache` folder is used as `Storage` for each `VectorStoreIndex`.

Each subfolder in the `cache` folder contains the data for one `VectorStoreIndex`. To set which `VectorStoreIndex` is used for a bot, use the subfolder's name as `datasource` attribute in the [bot's data](../frontend/app/bots/bot.data.ts).

> **Note**: To use the changed bots, you have to clear your local storage. Otherwise, the old bots are still used. You can clear your local storage by opening the developer tools and running `localStorage.clear()` in the console and reloading the page

### Generate a datasource

To generate a datasource, you can use the `generate.py` script:

```
python generate.py {datasource_name}
```

This will read all files in the `datasources/{datasource_name}` folder, split them, create their embeddings and store the new datasource in the `cache/{datasource_name}` folder.
