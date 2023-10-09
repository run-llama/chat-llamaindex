import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import {
  OpenAI,
  ChatMessage,
  HistoryChatEngine,
  SummaryChatHistory,
} from "llamaindex";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const {
    message,
    chatHistory,
    config,
  }: { message: string; chatHistory: ChatMessage[]; config: any } = req.body;
  if (!message || !chatHistory || !config) {
    return res
      .status(400)
      .json({ error: "messages and config are required in the request body" });
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
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");

    const stream = await chatEngine.chat(message, undefined, true);
    for await (const content of stream) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
    // get the new messages (might be more than one using the SummaryChatHistory)
    const newMessages = chatEngine.chatHistory.messages.slice(messagesBefore);
    res.end(
      `data: ${JSON.stringify({
        done: true,
        newMessages: newMessages,
      })}\n\n`,
    );
  } else {
    const response = await chatEngine.chat(message);
    const newMessages = chatEngine.chatHistory.messages.slice(messagesBefore);
    res
      .status(200)
      .json({ content: response.response, newMessages: newMessages });
  }
});

export default router.handler({
  onError: (error: any, req, res) => {
    console.error("[Llama]", error);
    res.status(500).json({ error: error.message });
  },
});
