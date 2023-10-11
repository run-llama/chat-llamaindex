import {
  OpenAI,
  ChatMessage,
  HistoryChatEngine,
  serviceContextFromDefaults,
  ContextChatEngine,
  ServiceContext,
} from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "./datasource";
import { logRuntime } from "../../utils/runtime";

async function createChatEngine(
  serviceContext: ServiceContext,
  chatHistory: ChatMessage[],
  datasource?: string,
) {
  if (datasource) {
    // Split text and create embeddings. Store them in a VectorStoreIndex
    const index = await logRuntime(
      `Retrieving datasource '${datasource}'`,
      async () => await getDataSource(serviceContext, datasource),
    );

    const retriever = index.asRetriever();
    retriever.similarityTopK = 5;
    // TODO: add history to context chat engine
    // TODO: generate new system prompt if bot has one
    return new ContextChatEngine({ retriever, chatHistory });
  }

  return new HistoryChatEngine({
    llm: serviceContext.llm as OpenAI,
    chatHistory: chatHistory,
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      chatHistory,
      datasource,
      config,
    }: {
      message: string;
      chatHistory: ChatMessage[];
      datasource: string | undefined;
      config: any;
    } = body;
    if (!message || !chatHistory || !config) {
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
      llm: llm,
      chunkSize: 512,
    });

    const chatEngine = await createChatEngine(
      serviceContext,
      chatHistory,
      datasource,
    );
    const messagesBefore = chatHistory.length;

    if (config.stream) {
      let responseStream = new TransformStream();
      const writer = responseStream.writable.getWriter();
      const encoder = new TextEncoder();

      const stream = await chatEngine.chat(message, undefined, true);
      const onNext = async () => {
        const { value, done } = await stream.next();
        if (!done) {
          writer.write(
            encoder.encode(`data: ${JSON.stringify({ content: value })}\n\n`),
          );
          onNext();
        } else {
          // get the new messages (might be more than one using the SummaryChatHistory)
          const newMessages = chatEngine.chatHistory.slice(messagesBefore);
          writer.write(
            `data: ${JSON.stringify({
              done: true,
              newMessages: newMessages,
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
      const response = await chatEngine.chat(message);
      const newMessages = chatEngine.chatHistory.slice(messagesBefore);
      return NextResponse.json({
        content: response.response,
        newMessages: newMessages,
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
