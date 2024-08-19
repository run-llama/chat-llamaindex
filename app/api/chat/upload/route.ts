import { NextRequest, NextResponse } from "next/server";
import { initSettings } from "../engine/settings";
import { uploadDocument } from "@/cl/app/api/chat/llamaindex/documents/upload";
import { getDataSource } from "../engine";

initSettings();

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Custom upload API to use datasource from request body
export async function POST(request: NextRequest) {
  try {
    const {
      filename,
      base64,
      datasource,
    }: { filename: string; base64: string; datasource: string } =
      await request.json();
    if (!base64 || !datasource) {
      return NextResponse.json(
        { error: "base64 and datasource is required in the request body" },
        { status: 400 },
      );
    }
    const index = await getDataSource(datasource);
    if (!index) {
      throw new Error(
        `StorageContext is empty - call 'pnpm run generate ${datasource}' to generate the storage first`,
      );
    }
    return NextResponse.json(await uploadDocument(index, filename, base64));
  } catch (error) {
    console.error("[Upload API]", error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 },
    );
  }
}
