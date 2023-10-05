import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI, SimpleChatEngine, ChatMessage } from "llamaindex";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { messages, config }: { messages: ChatMessage[]; config: any } =
    req.body;
  if (!messages || !config) {
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

  const chatEngine = new SimpleChatEngine({ llm: llm });
  const lastMessage = messages[messages.length - 1];
  const messagesWithoutLast = messages.slice(0, -1);

  if (config.stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");

    const stream = await chatEngine.chat(
      lastMessage.content,
      messagesWithoutLast,
      true
    );
    for await (const content of stream) {
      res.write(`data: ${JSON.stringify({ content })}\n\n`);
    }
    res.end("data: [DONE]\n\n");
  } else {
    const response = await chatEngine.chat(
      lastMessage.content,
      messagesWithoutLast,
    );
    res.status(200).json({ content: response.response });
  }
});

export default router.handler({
  onError: (error: any, req, res) => {
    console.error("[Llama]", error);
    res.status(500).json({ error: error.message });
  },
});
