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

export const ALLOWED_IMAGE_EXTENSIONS = ["jpeg", "jpg", "png", "gif", "webp"];
export const ALLOWED_TEXT_EXTENSIONS = ["pdf", "txt"];
export const ALLOWED_DOCUMENT_EXTENSIONS = [
  ...ALLOWED_TEXT_EXTENSIONS,
  ...ALLOWED_IMAGE_EXTENSIONS,
];
export const DOCUMENT_FILE_SIZE_LIMIT = 1024 * 1024 * 10; // 10 MB

export const DOCUMENT_TYPES = [
  "text/html",
  "application/pdf",
  "text/plain",
] as const;

export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
] as const;

export type ImageType = (typeof IMAGE_TYPES)[number];
