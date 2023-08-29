import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { requestOpenai } from "../../common";

async function handle(
  req: NextRequest,
  { params }: { params: { path: string[] } },
) {
  console.log("[OpenAI Route] params ", params);

  if (req.method === "OPTIONS") {
    return NextResponse.json({ body: "OK" }, { status: 200 });
  }

  // remove proxy prefix from pathname
  req.nextUrl.pathname = req.nextUrl.pathname.replaceAll("/api/openai/n/", "/");

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
