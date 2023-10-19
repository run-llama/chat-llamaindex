export type Embedding = {
  text: string;
  embedding: number[];
};

export type URLDetail = {
  url: string;
  size: number;
  type: "text/html" | "application/pdf" | "text/plain";
  embeddings?: Embedding[];
};

export type URLDetailContent = URLDetail & {
  content?: string;
};
