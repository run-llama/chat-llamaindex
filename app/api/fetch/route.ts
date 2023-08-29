import { fetchContentFromURL } from "@/app/utils/content";
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

  const host = request.headers.get("host");
  const protocol = request.headers.get("x-forwarded-proto") || "http";
  const serverURL = `${protocol}://${host}`;

  try {
    const urlContent = await fetchContentFromURL(site, serverURL);
    return NextResponse.json(urlContent);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
