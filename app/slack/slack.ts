import { getServerSideConfig } from "../config/server";

const url = getServerSideConfig().slackWebhookUrl!;

export function sendSlackMessage(text: string) {
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
