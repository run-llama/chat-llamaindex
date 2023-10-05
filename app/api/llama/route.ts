import {
  OpenAI,
  ChatMessage,
  HistoryChatEngine,
  SummaryChatHistory,
} from "llamaindex";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      message,
      chatHistory,
      config,
    }: { message: string; chatHistory: ChatMessage[]; config: any } = body;
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

    const chatEngine = new HistoryChatEngine({
      llm: llm,
      chatHistory: new SummaryChatHistory({ messages: chatHistory, llm: llm }),
    });
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
          const newMessages =
            chatEngine.chatHistory.messages.slice(messagesBefore);
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
      const newMessages = chatEngine.chatHistory.messages.slice(messagesBefore);
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
