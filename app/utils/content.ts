import { unified } from "unified";
import parse from "rehype-parse";
import rehype2remark from "rehype-remark";
import stringify from "remark-stringify";
import { remove } from "unist-util-remove";
import { URLDetailContent } from "../store";
import { PDF_TO_TEXT_API_ROUTE } from "../constant";

function removeCommentsAndTables() {
  return (tree: any) => {
    remove(tree, { type: "comment" });
    remove(tree, { tagName: "table" });
  };
}

export async function htmlToMarkdown(html: string): Promise<string> {
  const processor = unified()
    .use(parse) // Parse the HTML
    .use(removeCommentsAndTables) // Remove comment nodes
    .use(rehype2remark as any) // Convert it to Markdown
    .use(stringify); // Stringify the Markdown

  const file = await processor.process(html);
  return String(file);
}

export async function fetchContentFromURL(
  url: string,
  host: string,
): Promise<URLDetailContent> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error("Failure fetching content from provided URL");
  }

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("text/html")) {
    const htmlContent = await response.text();
    const markdownContent = await htmlToMarkdown(htmlContent);
    return {
      url,
      content: markdownContent,
      size: htmlContent.length,
      type: "text/html",
    };
  }

  if (contentType.includes("application/pdf")) {
    // FIXME: Do conversion in this API instead of calling another API
    const res = await fetch(
      `${host}${PDF_TO_TEXT_API_ROUTE}?url=${encodeURIComponent(url)}`,
    );
    const data = await res.json();
    return data;
  }

  throw new Error("URL provided is not a PDF or HTML document");
}
