import { REQUEST_TIMEOUT_MS } from "@/app/constant";

import { ChatOptions, LLMApi } from "./interfaces";

import { prettyObject } from "@/app/utils/format";
import { fetchEventSource } from "@fortaine/fetch-event-source";

export class OpenAIApi implements LLMApi {
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

          if (res.ok && contentType?.startsWith("text/plain")) {
            // if the response is text/plain, then it's a normal chat response - no streaming
            responseText = await res.clone().text();
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
          const delta = msg.data;
          if (delta) {
            responseText += delta;
            options.onUpdate?.(responseText, delta);
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
