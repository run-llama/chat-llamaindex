import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "../../common";
import { Bot } from "@/app/store/bot";
import { kv } from "@vercel/kv";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[OpenAI Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  // lookup token of the shared bot via its id
  const botId = params.path.shift();
  // remove proxy prefix from pathname
  req.nextUrl.pathname = req.nextUrl.pathname.replaceAll(
    /\/api\/openai\/b\/[^\/]+\//g,
    "/",
  );
  try {
    const res: { bot: Bot } | null = await kv.get(botId!);
    const token = res?.bot.share?.token || null;
    if (token) {
      req.headers.set("Authorization", "Bearer " + token);
    }
  } catch (e) {
    console.error(`[OpenAI] failed to load bot with key ${botId}`, e);
    return NextResponse.json(prettyObject(e));
  }

  try {
    return await requestOpenai(req);
  } catch (e) {
    console.error("[OpenAI] ", e);
    return NextResponse.json(prettyObject(e));
  }
}

export const GET = handle;
export const POST = handle;

export const runtime = "edge";
