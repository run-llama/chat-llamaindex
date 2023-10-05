import {
  fetchContentFromURL,
  getPDFContentFromBuffer,
} from "@/app/utils/content";
import { NextResponse, NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const searchParams = new URLSearchParams(url.search);
  const site = searchParams.get("site");
  if (!site) {
    return NextResponse.json(
      { error: "Missing site parameter" },
      { status: 400 },
    );
  }

  try {
    const urlContent = await fetchContentFromURL(site);
    return NextResponse.json(urlContent);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body || !body.pdf) {
      return NextResponse.json(
        { error: "PDF file is required in the request body" },
        { status: 400 },
      );
    }

    const pdfBuffer = Buffer.from(body.pdf, "base64");
    const pdfData = await getPDFContentFromBuffer(pdfBuffer);
    return NextResponse.json({
      ...pdfData,
      url: body.fileName,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: (error as Error).message,
      },
      {
        status: 500,
      },
    );
  }
}
