import {
  ChatMessage,
  DefaultContextGenerator,
  HistoryChatEngine,
  IndexDict,
  OpenAI,
  ServiceContext,
  SimpleChatHistory,
  SummaryChatHistory,
  TextNode,
  VectorStoreIndex,
  serviceContextFromDefaults,
} from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { LLMConfig } from "../../client/platforms/llm";
import { getDataSource } from "./datasource";
import { DATASOURCES_CHUNK_SIZE } from "@/scripts/constants.mjs";
import { Embedding } from "@/app/client/fetch";

async function createChatEngine(
  serviceContext: ServiceContext,
  datasource?: string,
  embeddings?: Embedding[],
) {
  let contextGenerator;
  if (datasource || embeddings) {
    let index;
    if (datasource) {
      index = await getDataSource(serviceContext, datasource);
    }
    if (embeddings) {
      index = await createIndex(serviceContext, embeddings);
    }
    const retriever = index!.asRetriever();
    retriever.similarityTopK = 5;

    contextGenerator = new DefaultContextGenerator({ retriever });
  }

  return new HistoryChatEngine({
    llm: serviceContext.llm,
    contextGenerator,
  });
}

async function createIndex(
  serviceContext: ServiceContext,
  embeddings: Embedding[],
) {
  const embeddingResults = embeddings.map((config) => {
    return new TextNode({ text: config.text, embedding: config.embedding });
  });
  const indexDict = new IndexDict();
  for (const node of embeddingResults) {
    indexDict.addNode(node);
  }

  const index = await VectorStoreIndex.init({
    indexStruct: indexDict,
    serviceContext: serviceContext,
  });

  index.vectorStore.add(embeddingResults);
  if (!index.vectorStore.storesText) {
    await index.docStore.addDocuments(embeddingResults, true);
  }
  await index.indexStore?.addIndexStruct(indexDict);
  index.indexStruct = indexDict;
  return index;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      chatHistory: messages,
      datasource,
      config,
      embeddings,
    }: {
      message: string;
      chatHistory: ChatMessage[];
      datasource: string | undefined;
      config: LLMConfig;
      embeddings: Embedding[] | undefined;
    } = body;
    if (!message || !messages || !config) {
      return NextResponse.json(
        {
          error:
            "message, chatHistory and config are required in the request body",
        },
        { status: 400 },
      );
    }

    const llm = new OpenAI({
      model: config.model,
      temperature: config.temperature,
      topP: config.topP,
      maxTokens: config.maxTokens,
    });

    const serviceContext = serviceContextFromDefaults({
      llm,
      chunkSize: DATASOURCES_CHUNK_SIZE,
    });

    const chatEngine = await createChatEngine(
      serviceContext,
      datasource,
      embeddings,
    );
    const chatHistory = config.sendMemory
      ? new SummaryChatHistory({ llm, messages })
      : new SimpleChatHistory({ messages });

    if (config.stream) {
      let responseStream = new TransformStream();
      const writer = responseStream.writable.getWriter();
      const encoder = new TextEncoder();

      const stream = await chatEngine.chat(message, chatHistory, true);
      const onNext = async () => {
        const { value, done } = await stream.next();
        if (!done) {
          writer.write(
            encoder.encode(`data: ${JSON.stringify({ content: value })}\n\n`),
          );
          onNext();
        } else {
          writer.write(
            `data: ${JSON.stringify({
              done: true,
              newMessages: chatHistory.newMessages(),
            })}\n\n`,
          );
          writer.close();
        }
      };
      onNext();

      return new NextResponse(responseStream.readable, {
        headers: {
          "Content-Type": "text/event-stream",
          Connection: "keep-alive",
          "Cache-Control": "no-cache, no-transform",
        },
      });
    } else {
      const response = await chatEngine.chat(message, chatHistory);
      return NextResponse.json({
        content: response.response,
        newMessages: chatHistory.newMessages(),
      });
    }
  } catch (error) {
    console.error("[Llama]", error);
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
