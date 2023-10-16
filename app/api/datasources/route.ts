import { NextResponse } from "next/server";
import { generateDatasource } from "./datasource";
import { serviceContextFromDefaults } from "llamaindex";
import { DATASOURCES, DATASOURCES_CHUNK_SIZE } from "@/app/constant";

export async function GET() {
  const serviceContext = serviceContextFromDefaults({
    chunkSize: DATASOURCES_CHUNK_SIZE,
  });

  for (const datasource of DATASOURCES) {
    await generateDatasource(serviceContext, datasource);
  }
  return NextResponse.json({
    message: "Datasources generated",
    datasources: DATASOURCES,
  });
}
