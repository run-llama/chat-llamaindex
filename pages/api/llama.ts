import { createRouter } from "next-connect";
import type { NextApiRequest, NextApiResponse } from "next";
import { Event, EventType } from "llamaindex";
import { OpenAI } from "llamaindex";

const router = createRouter<NextApiRequest, NextApiResponse>();

router.post(async (req, res) => {
  const { messages } = req.body;
  if (!messages) {
    return res
      .status(400)
      .json({ error: "messages are required in the request body" });
  }

  const llm = new OpenAI({ model: "gpt-3.5-turbo", temperature: 0.1 });

  //Create a dummy event to trigger our Stream Callback
  const dummy_event: Event = {
    id: "something",
    type: "intermediate" as EventType,
  };

  try {
    const response = await llm.chat(messages, dummy_event);
    res.status(200).json({ choices: [response] });
  } catch (e: any) {
    console.error("[Llama]", e);
    res.status(500).send({ error: e.error });
  }
});

export default router.handler({
  onError: (error: any, req, res) => {
    res.status(400).json({ error: error.message });
  },
});
