import { FETCH_SITE_CONTENT_URL } from "../constant";
import { URLDetailContent } from "../store";

export const isURL = (text: string) => {
  const isUrlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;
  return isUrlRegex.test(text);
};

export async function fetchSiteContent(
  site: string,
): Promise<URLDetailContent> {
  const response = await fetch(`${FETCH_SITE_CONTENT_URL}?site=${site}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error);
  return data as URLDetailContent;
}
