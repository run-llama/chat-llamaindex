import { env } from "../env.mjs";

export function sendSlackMessage(text: string) {
  const url = env.SLACK_WEBHOOK_URL;
  if (!url) return;
  fetch(url, {
    method: "POST",
    body: JSON.stringify({ text: text }),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.text())
    .then((text) => console.log(text))
    .catch((error) => console.error("Error:", error));
}
