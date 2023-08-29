import {
  DEFAULT_API_HOST,
  OpenaiPath,
  REQUEST_TIMEOUT_MS,
} from "@/app/constant";

import { ChatOptions, LLMApi } from "./interfaces";
import Locale from "../../../locales";

import {
  EventStreamContentType,
  fetchEventSource,
} from "@fortaine/fetch-event-source";
import { prettyObject } from "@/app/utils/format";
import { Share } from "@/app/store/bot";
import { getClientConfig } from "@/app/config/client";

function getHeaders(token?: string) {
  let headers: Record<string, string> = {
    "Content-Type": "application/json",
    "x-requested-with": "XMLHttpRequest",
  };

  const makeBearer = (token: string) => `Bearer ${token.trim()}`;

  if (token && token.length > 0) {
    headers.Authorization = makeBearer(token);
  }

  return headers;
}

export class OpenAIApi implements LLMApi {
  path(path: string, share: Share | null = null): string {
    const botId = share?.id;
    const botHasToken = share?.hasToken || share?.token;
    const clientConfig = getClientConfig();

    if (clientConfig?.hasServerApiKey) {
      // if the server has an api key configured, use it by calling the proxy
      return `/api/openai/n/${path}`;
    }

    // use API proxy for bots with token
    if (botId && botHasToken) {
      return `/api/openai/b/${botId}/${path}`;
    }

    // all other calls can be direct without proxy
    return [DEFAULT_API_HOST, path].join("/");
  }

  extractMessage(res: any) {
    return res.choices?.at(0)?.message?.content ?? "";
  }

  async chat(options: ChatOptions) {
    const messages = options.messages.map((v) => ({
      role: v.role,
      content: v.content,
    }));

    const requestPayload = {
      messages,
      stream: options.config.stream,
      model: options.config.model,
      temperature: options.config.temperature,
      presence_penalty: options.config.presence_penalty,
      frequency_penalty: options.config.frequency_penalty,
      top_p: options.config.top_p,
    };

    console.log("[Request] openai payload: ", requestPayload);

    const shouldStream = !!options.config.stream;
    const controller = new AbortController();
    options.onController?.(controller);

    try {
      const chatPath = this.path(OpenaiPath.ChatPath, options.share);
      const chatPayload = {
        method: "POST",
        body: JSON.stringify(requestPayload),
        signal: controller.signal,
        headers: getHeaders(options.token),
      };

      // make a fetch request
      const requestTimeoutId = setTimeout(
        () => controller.abort(),
        REQUEST_TIMEOUT_MS,
      );

      if (shouldStream) {
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
            console.log(
              "[OpenAI] request response content type: ",
              contentType,
            );

            if (contentType?.startsWith("text/plain")) {
              responseText = await res.clone().text();
              return finish();
            }

            if (
              !res.ok ||
              !res.headers
                .get("content-type")
                ?.startsWith(EventStreamContentType) ||
              res.status !== 200
            ) {
              const responseTexts = [responseText];
              let extraInfo = await res.clone().text();
              try {
                const resJson = await res.clone().json();
                extraInfo = prettyObject(resJson);
              } catch {}

              if (res.status === 401) {
                responseTexts.push(Locale.Error.Unauthorized);
              }

              if (extraInfo) {
                responseTexts.push(extraInfo);
              }

              responseText = responseTexts.join("\n\n");

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
              const delta = json.choices[0].delta.content;
              if (delta) {
                responseText += delta;
                options.onUpdate?.(responseText, delta);
              }
            } catch (e) {
              console.error("[Request] parse error", text, msg);
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
      } else {
        const res = await fetch(chatPath, chatPayload);
        clearTimeout(requestTimeoutId);

        const resJson = await res.json();
        if (resJson.error) {
          console.log("[Request] failed to make a chat request", resJson.error);
          options.onError?.(resJson.error);
          return;
        }
        const message = this.extractMessage(resJson);
        options.onFinish(message);
      }
    } catch (e) {
      console.log("[Request] failed to make a chat request", e);
      options.onError?.(e as Error);
    }
  }
}
