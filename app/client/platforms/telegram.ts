import telegramifyMarkdown from "telegramify-markdown";

const timeout: number = 10;

export enum ParseMode {
  "MarkdownV2" = "MarkdownV2",
  "HTML" = "HTML",
}

export interface PollUpdate {
  update_id: number;
  my_chat_member: {
    chat: {
      id: number;
    };
  };
  message: {
    chat: {
      id: number;
    };
    text: string;
  };
}

interface TelegramResponse {
  ok: boolean;
  result: PollUpdate[];
  error_code?: number;
}

export interface PollResponse {
  ok: boolean;
  newOffset?: number;
  description?: string;
  error_code?: number;
}

export type PollUpdater = (update: PollUpdate) => void;

export class TelegramAPI {
  sendMessage(
    token: string,
    chatId: number,
    text: string,
    parse_mode?: ParseMode,
  ): void {
    if (parse_mode === ParseMode.MarkdownV2) {
      // XXX: need to escape > and | symbols as telegramifyMarkdown doesn't do it
      const clean = (text: string) => text.replace(/([>|])/g, "\\$1");
      text = clean(telegramifyMarkdown(text));
    }

    const data = {
      chat_id: chatId,
      text: text,
      parse_mode: parse_mode,
    };

    console.log("[Request] telegram payload: ", data);

    fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      body: JSON.stringify(data),
      headers: {
        "Content-Type": "application/json",
      },
    }).catch(console.error);
  }

  async poll(
    token: string,
    updater: PollUpdater,
    offset?: number,
  ): Promise<PollResponse> {
    let url: string = `https://api.telegram.org/bot${token}/getUpdates?timeout=${timeout}`;
    if (offset) url += "&offset=" + offset;

    try {
      const response = await fetch(url);
      const data: TelegramResponse = await response.json();
      if (!data.ok) {
        return data;
      }
      const updates = data.result;
      let newOffset: number | undefined;
      if (updates.length > 0) {
        newOffset = updates[updates.length - 1].update_id + 1;
      }
      updates.forEach((data) => updater(data));
      return { ok: true, newOffset };
    } catch (err: any) {
      return { ok: false, description: err.message };
    }
  }
}
