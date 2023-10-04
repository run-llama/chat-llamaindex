import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import { OpenAI } from "llamaindex";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { messages, config } = req.body;
  if (!messages) {
    return res
      .status(400)
      .json({ error: "messages are required in the request body" });
  }
  const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });

  if (config.stream) {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    const stream = llm.stream_chat(messages);
    for await (const token of stream) {
      res.write(`data: ${token}\n\n`);
    }
    res.end("data: [DONE]\n\n");
  } else {
    res.setHeader("Content-Type", "text/plain");
    const response = await llm.chat(messages);
    res.status(200).send(response.message.content);
  }
});

export default router.handler({
  onError: (error: any, req, res) => {
    console.error("[Llama]", error);
    res.status(500).json({ error: error.message });
  },
});
