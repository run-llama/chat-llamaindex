<br /><br />

<p align="center">
  <img src="./public/android-chrome-192x192.png" alt="LlamaIndex Chat Logo" width="70">
</p>

<h3 align="center"><b>LlamaIndex Chat</b></h3>
<p align="center"><b>Create chat bots that know your data</b></p>

<p>
      <img
        src="./public/screenshot.png"
        alt="LlamaIndex Chat Screen"
        width="100%"
      />
</p>

Welcome to [LlamaIndex Chat](https://github.com/run-llama/chat-llamaindex). You can create and share LLM chatbots that
know your data (PDF or text documents).

Getting started with LlamaIndex Chat is a breeze. Visit [TBD](TBD) - a hosted version of LlamaIndex Chat with no user authentication that provides an immediate start.

## 🚀 Features

LlamaIndex Chat is an example chat bot application for [LlamaIndexTS](https://github.com/run-llama/LlamaIndexTS). It features:

- Create bots using prompt engineering and share them with other users.
- Modify the demo bots by using the UI or directly editing the [bots/bots.data.ts](./bots/bots.data.ts) file.
- Integrate your own data by uploading documents or generating new [datasources](#datasources).

## ⚡️ Quick start

### Local Development

Requirement: [NodeJS](https://nodejs.org) 18

- Clone the repository

```bash
git clone https://github.com/run-llama/chat-llamaindex
cd chat-llamaindex
```

- Set the environment variables

```bash
cp .env.template .env.development.local
```

Edit environment variables in `.env.development.local`.

- Run the dev server

```bash
pnpm install
pnpm dev
```

### Vercel Deployment

Deploying to Vercel is simple, just click the button below and follow the instructions:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frun-llama%2Fchat-llamaindex&env=OPENAI_API_KEY)

You might want to consider deploying to a [Vercel Pro](https://vercel.com/docs/accounts/plans#pro) account, as the running time
of the chat engine is limited to 10 seconds on the free plan. Before deploying, make sure to [change the desired running time](./app/api/llm/route.ts#L179) in the code.

## 📀 Data Sources

The app is using a [`ChatEngine`](https://ts.llamaindex.ai/modules/high_level/chat_engine) for each bot with a [`VectorStoreIndex`](https://ts.llamaindex.ai/modules/high_level/data_index) attached.
The `cache` folder in the root directoy is used as [Storage](https://ts.llamaindex.ai/modules/low_level/storage) for each `VectorStoreIndex`.

Each subfolder in the `cache` folder contains the data for one `VectorStoreIndex`. To set which `VectorStoreIndex` is used for a bot, use the subfolder's name as `datasource` attribute in the [bot's data](./bots/bots.data.ts).

### Generate Data Sources

To generate a new data source, create a new subfolder in the `datasources` directory and add the data files (e.g. PDFs) to it.
Then create the `VectorStoreIndex` for the datasource, by running the following command:

```bash
pnpm run generate <datasource-name>
```

Where `<datasource-name>` is the name of the subfolder with your data files.

## 🙏 Thanks

Thanks go to @Yidadaa for his [ChatGPT-Next-Web](https://github.com/Yidadaa/ChatGPT-Next-Web) project, which was used as a starter template for this project.
