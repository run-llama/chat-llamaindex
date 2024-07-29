import { NextRequest, NextResponse } from "next/server";
import { initSettings } from "../engine/settings";
import { uploadDocument } from "./documents/upload";

initSettings();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { base64, datasource }: { base64: string; datasource: string } =
      await request.json();
    if (!base64 || !datasource) {
      return NextResponse.json(
        { error: "base64 and datasource is required in the request body" },
        { status: 400 },
      );
    }
    return NextResponse.json(await uploadDocument(base64, datasource));
  } catch (error) {
    console.error("[Upload API]", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
