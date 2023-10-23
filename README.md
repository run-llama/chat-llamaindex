<br /><br />

<p align="center">
  <img src="./public/android-chrome-192x192.png" alt="Unc Logo" width="70">
</p>

<h3 align="center"><b>Unc</b></h3>
<p align="center"><b>A privacy-first, enterprise-ready, open-source ChatGPT platform</b></p>

<p>
      <img
        src="./public/screenshot.png"
        alt="Unc Screen"
        width="100%"
      />
</p>

Welcome to [Unc](https://unc.de). A robust, scalable open-source platform built specifically for implementing privacy-first, enterprise-level ChatGPT.

Getting started with Unc is a breeze. Visit [unc.de](https://unc.de) - a hosted version of Unc with no user authentication, provides an immediate start.

## 🚀 Features

Unc is enterprise-ready, featuring:

- Self-hosted, can be installed in own cloud (private or public).
- Chat with your own HTML and PDF documents.
- Create bots using prompt engineering (no-code) and share them with other users. This avoids the repetition of frequently used prompts.
- Supports [Azure OpenAI from Microsoft](https://azure.microsoft.com/en-us/products/ai-services/openai-service), eliminating traffic to OpenAI.
- Privacy first; personal data is stored locally in the browser.

## ⚡️ Quick start

### Local Development

Requirement: [NodeJS](https://nodejs.org) 18

- Clone the repository

```bash
git clone https://github.com/marcusschiesser/unc
cd unc
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

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fmarcusschiesser%2Func&env=OPENAI_API_KEY)

You might want to consider deploying to a [Vercel Pro](https://vercel.com/docs/accounts/plans#pro) account, as the running time
of the chat engine is limited to 10 seconds on the free plan. Before deploying, make sure to [change the desired running time](./app/api/llm/route.ts#L179) in the code.

## Recreate Storage

The app is using a [`ChatEngine`](https://ts.llamaindex.ai/modules/high_level/chat_engine) for each bot with a different [`VectorStoreIndex`](https://ts.llamaindex.ai/modules/high_level/data_index) attached.
The `cache` folder in the file system is used as [Storage](The https://ts.llamaindex.ai/modules/low_level/storage) for the `VectorStoreIndex`. To re-create the storage
Vector Indexes

```bash
pnpm run generate
```
