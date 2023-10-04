import { REQUEST_TIMEOUT_MS } from "@/app/constant";

import { prettyObject } from "@/app/utils/format";
import { fetchEventSource } from "@fortaine/fetch-event-source";

export const ROLES = ["system", "user", "assistant", "URL"] as const;
export type MessageRole = (typeof ROLES)[number];

export interface RequestMessage {
  role: MessageRole;
  content: string;
}

export interface LLMConfig {
  model: string;
  temperature?: number;
  topP?: number;
  stream?: boolean;
  presence_penalty?: number;
  frequency_penalty?: number;
}

export interface ChatOptions {
  messages: RequestMessage[];
  config: LLMConfig;
  onUpdate?: (message: string, chunk: string) => void;
  onFinish: (message: string) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
}

export class LLMApi {
  async chat(options: ChatOptions) {
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: v.content,
    }));

    const requestPayload = {
      messages,
      config: options.config,
    };

    console.log("[Request] openai payload: ", requestPayload);

    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = "/api/llama";
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
          "x-requested-with": "XMLHttpRequest",
        },
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      let responseText = "";
      let finished = false;

      const finish = () => {
        if (!finished) {
          options.onFinish(responseText);
          finished = true;
        }
      };

      controller.signal.onabort = finish;

      await fetchEventSource(chatPath, {
        ...chatPayload,
        async onopen(res) {
          clearTimeout(requestTimeoutId);
          const contentType = res.headers.get("content-type");
          console.log("[OpenAI] request response content type: ", contentType);

          if (res.ok && contentType?.startsWith("application/json")) {
            // if the response is application/json, then it's a normal chat response - no streaming
            responseText = (await res.clone().json()).content;
            return finish();
          }

          if (!res.ok) {
            responseText = await res.clone().text();
            try {
              const resJson = await res.clone().json();
              responseText = prettyObject(resJson);
            } catch {}
            return finish();
          }
        },
        onmessage(msg) {
          if (msg.data === "[DONE]" || finished) {
            return finish();
          }
          const text = msg.data;
          try {
            const json = JSON.parse(text);
            const delta = json.content;
            if (delta) {
              responseText += delta;
              options.onUpdate?.(responseText, delta);
            }
          } catch (e) {
            console.error("[Request] error parsing streaming delta", msg);
          }
        },
        onclose() {
          finish();
        },
        onerror(e) {
          options.onError?.(e);
          throw e;
        },
        openWhenHidden: true,
      });
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
}
