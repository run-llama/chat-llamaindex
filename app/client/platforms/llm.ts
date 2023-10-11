import { REQUEST_TIMEOUT_MS } from "@/app/constant";

import { prettyObject } from "@/app/utils/format";
import { fetchEventSource } from "@fortaine/fetch-event-source";

export const ROLES = ["system", "user", "assistant", "URL", "memory"] as const;
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
}

export interface ChatOptions {
  message: string;
  chatHistory: RequestMessage[];
  config: LLMConfig;
  datasource?: string;
  onUpdate?: (message: string) => void;
  onFinish: (newMessages: RequestMessage[]) => void;
  onError?: (err: Error) => void;
  onController?: (controller: AbortController) => void;
}

export class LLMApi {
  async chat(options: ChatOptions) {
    const requestPayload = {
      message: options.message,
      chatHistory: options.chatHistory,
      config: options.config,
      datasource: options.datasource,
    };

    console.log("[Request] payload: ", requestPayload);

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

      const finish = (newMessages?: RequestMessage[]) => {
        if (!finished) {
          if (!newMessages) {
            options.onFinish([{ role: "assistant", content: responseText }]);
          } else {
            options.onFinish(newMessages);
          }
          finished = true;
        }
      };

      controller.signal.onabort = () => finish();

      await fetchEventSource(chatPath, {
        ...chatPayload,
        async onopen(res) {
          clearTimeout(requestTimeoutId);
          const contentType = res.headers.get("content-type");
          console.log("[OpenAI] request response content type: ", contentType);

          if (res.ok && contentType?.startsWith("application/json")) {
            // if the response is application/json, then it's a normal chat response - no streaming
            const result = await res.clone().json();
            return finish(result.newMessages);
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
          try {
            const json = JSON.parse(msg.data);
            if (json.done || finished) {
              return finish(json.newMessages);
            }
            const delta = json.content;
            if (delta) {
              responseText += delta;
              options.onUpdate?.(responseText);
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
