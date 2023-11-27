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

Welcome to [LlamaIndex Chat](https://github.com/run-llama/chat-llamaindex). You can create and share LLM chatbots that know your data (PDF or text documents).

Getting started with LlamaIndex Chat is a breeze. Visit https://chat-llamaindex.vercel.app - a hosted version of LlamaIndex Chat with no user authentication that provides an immediate start.

## 🚀 Features

LlamaIndex Chat is an example chatbot application for [LlamaIndexTS](https://github.com/run-llama/LlamaIndexTS).
You can:

- Create bots using prompt engineering and share them with other users.
- Modify the demo bots by using the UI or directly editing the [./app/bots/bot.data.ts](./app/bots/bot.data.ts) file.
- Integrate your data by uploading documents or generating new [data sources](#📀-data-sources).

## ⚡️ Quick start

### Local Development

Make sure the backend is running first.
Frontend Requirement: [NodeJS](https://nodejs.org) 18

- Run the dev server

```bash
pnpm install
pnpm dev
```

### Vercel Deployment

Deploying to Vercel is simple; click the button below and follow the instructions:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Frun-llama%2Fchat-llamaindex&env=OPENAI_API_KEY)

If you're deploying to a [Vercel Hobby](https://vercel.com/docs/accounts/plans#hobby) account, [change the running time](./app/api/llm/route.ts#L196) to 10 seconds, as this is the limit for the free plan.

If you want to use the [sharing](#🔄-sharing) functionality, then you need to create a Vercel KV store and connect it to your project.
Just follow [this step from the quickstart](https://vercel.com/docs/storage/vercel-kv/quickstart#create-a-kv-database). No further configuration is necessary as the app automatically uses a connected KV store.

## 🔄 Sharing

LlamaIndex Chat supports the sharing of bots via URLs. Demo bots are read-only and can't be shared. But you can create new bots (or clone and modify a demo bot) and call the share functionality in the context menu. It will create a unique URL that you can share with others. Opening the URL, users can directly use the shared bot.

## 🙏 Thanks

Thanks go to @Yidadaa for his [ChatGPT-Next-Web](https://github.com/Yidadaa/ChatGPT-Next-Web) project, which was used as a starter template for this project.
