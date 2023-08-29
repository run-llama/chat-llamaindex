import { kv } from "@vercel/kv";
import { NextRequest, NextResponse } from "next/server";
import { Bot } from "@/app/store/bot";
import { TTL } from "../common";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body: { shareToken: string } = await req.json();

    const res: { bot: Bot } | null = await kv.get(params.id);
    if (!res) {
      throw new Error("Can't find bot with key " + params.id);
    }

    if (!res.bot.share) {
      throw new Error(`Bot with key ${params.id} doesn't have share data`);
    }
    res.bot.share.token = body.shareToken;
    const data = await kv.set<{ bot: Bot }>(params.id, res, {
      ex: TTL,
    });
    if (!data) {
      throw new Error(`Can't update bot with key ${params.id}`);
    }

    console.log(`[Share] updated shared key for bot with key ${params.id}`);

    return NextResponse.json({});
  } catch (error) {
    console.error("[Share] error while updating bot", error);
    return NextResponse.json(
      {
        error: true,
        msg: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}

export const runtime = "edge";
