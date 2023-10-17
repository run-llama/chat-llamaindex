import {
  ChatMessage,
  DefaultContextGenerator,
  HistoryChatEngine,
  OpenAI,
  ServiceContext,
  SimpleChatHistory,
  SummaryChatHistory,
  serviceContextFromDefaults,
} from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { LLMConfig } from "../../client/platforms/llm";
import { getDataSource } from "./datasource";
import { DATASOURCES_CHUNK_SIZE } from "@/scripts/constants.mjs";

async function createChatEngine(
  serviceContext: ServiceContext,
  datasource?: string,
) {
  let contextGenerator;
  if (datasource) {
    const index = await getDataSource(serviceContext, datasource);
    const retriever = index.asRetriever();
    retriever.similarityTopK = 5;

    contextGenerator = new DefaultContextGenerator({ retriever });
  }

  return new HistoryChatEngine({
    llm: serviceContext.llm,
    contextGenerator,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      chatHistory: messages,
      datasource,
      config,
    }: {
      message: string;
      chatHistory: ChatMessage[];
      datasource: string | undefined;
      config: LLMConfig;
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

    const chatEngine = await createChatEngine(serviceContext, datasource);
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
