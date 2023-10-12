import {
  OpenAI,
  ChatMessage,
  serviceContextFromDefaults,
  ServiceContext,
  DefaultContextGenerator,
  StatelessChatEngine,
  SummaryChatHistory,
} from "llamaindex";
import { NextRequest, NextResponse } from "next/server";
import { getDataSource } from "./datasource";
import { logRuntime } from "../../utils/runtime";

async function createChatEngine(
  serviceContext: ServiceContext,
  datasource?: string,
) {
  let contextGenerator;
  if (datasource) {
    // Split text and create embeddings. Store them in a VectorStoreIndex
    const index = await logRuntime(
      `Retrieving datasource '${datasource}'`,
      async () => await getDataSource(serviceContext, datasource),
    );
    const retriever = index.asRetriever();
    retriever.similarityTopK = 5;

    contextGenerator = new DefaultContextGenerator({ retriever });
  }

  return new StatelessChatEngine({
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
      config: any;
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
      chunkSize: 512,
    });

    const chatEngine = await createChatEngine(serviceContext, datasource);
    const chatHistory = new SummaryChatHistory({ llm, messages });

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
