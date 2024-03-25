import {
  ChatHistory,
  ChatMessage,
  ContextChatEngine,
  OpenAI,
  ServiceContext,
  SimpleChatEngine,
  SimpleChatHistory,
  SummaryChatHistory,
  TextNode,
  serviceContextFromDefaults,
  Response,
  VectorStoreIndex,
} from "llamaindex";
import { IndexDict } from "llamaindex/indices/json-to-index-struct";
import { NextRequest, NextResponse } from "next/server";
import { LLMConfig, MessageContent } from "@/app/client/platforms/llm";
import { getDataSource } from "./datasource";
import {
  DATASOURCES_CHUNK_OVERLAP,
  DATASOURCES_CHUNK_SIZE,
} from "@/scripts/constants.mjs";
import { Embedding } from "@/app/client/fetch/url";
import Locale from "@/app/locales";

async function createChatEngine(
  serviceContext: ServiceContext,
  datasource?: string,
  embeddings?: Embedding[],
) {
  if (datasource || embeddings) {
    let index;
    if (embeddings) {
      // TODO: merge indexes, currently we prefer own embeddings
      index = await createIndex(serviceContext, embeddings);
    } else if (datasource) {
      index = await getDataSource(serviceContext, datasource);
    }
    const retriever = index!.asRetriever();
    retriever.similarityTopK = 5;

    return new ContextChatEngine({
      chatModel: serviceContext.llm,
      retriever,
    });
  }

  return new SimpleChatEngine({
    llm: serviceContext.llm,
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

function createReadableStream(
  stream: AsyncIterable<Response>,
  chatHistory: ChatHistory,
) {
  const it = stream[Symbol.asyncIterator]();
  let responseStream = new TransformStream();
  const writer = responseStream.writable.getWriter();
  let aborted = false;
  writer.closed.catch(() => {
    // reader aborted the stream
    aborted = true;
  });
  const encoder = new TextEncoder();
  const onNext = async () => {
    try {
      const { value, done } = await it.next();
      if (aborted) return;
      if (!done) {
        writer.write(
          encoder.encode(`data: ${JSON.stringify(value.response)}\n\n`),
        );
        onNext();
      } else {
        writer.write(
          `data: ${JSON.stringify({
            done: true,
            // get the optional message containing the chat summary
            memoryMessage: chatHistory
              .newMessages()
              .filter((m) => m.role === "memory")
              .at(0),
          })}\n\n`,
        );
        writer.close();
      }
    } catch (error) {
      console.error("[LlamaIndex]", error);
      writer.write(
        `data: ${JSON.stringify({
          error: Locale.Chat.LLMError,
        })}\n\n`,
      );
      writer.close();
    }
  };
  onNext();
  return responseStream.readable;
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
      message: MessageContent;
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
      chunkOverlap: DATASOURCES_CHUNK_OVERLAP,
    });

    const chatEngine = await createChatEngine(
      serviceContext,
      datasource,
      embeddings,
    );
    const chatHistory = config.sendMemory
      ? new SummaryChatHistory({ llm, messages })
      : new SimpleChatHistory({ messages });

    const stream = await chatEngine.chat({
      message,
      chatHistory,
      stream: true,
    });
    const readableStream = createReadableStream(stream, chatHistory);

    return new NextResponse(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        Connection: "keep-alive",
        "Cache-Control": "no-cache, no-transform",
      },
    });
  } catch (error) {
    console.error("[LlamaIndex]", error);
    return NextResponse.json(
      {
        error: Locale.Chat.LLMError,
      },
      {
        status: 500,
      },
    );
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Set max running time of function, for Vercel Hobby use 10 seconds, see https://vercel.com/docs/functions/serverless-functions/runtimes#maxduration
export const maxDuration = 10;
