export const GITHUB_URL = "https://github.com/run-llama/chat-llamaindex";

export enum Path {
  Home = "/",
  Chat = "/",
  Settings = "/settings",
  Bots = "/",
}

export enum FileName {
  Bots = "bots.json",
}

export const REQUEST_TIMEOUT_MS = 60000;

export const CHAT_PAGE_SIZE = 15;
export const MAX_RENDER_MSG_COUNT = 45;

export const ALLOWED_DOCUMENT_EXTENSIONS = ["pdf", "txt", "jpeg", "jpg"];
export const DOCUMENT_FILE_SIZE_LIMIT = 1024 * 1024 * 10; // 10 MB
