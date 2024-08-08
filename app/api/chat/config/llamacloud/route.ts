import { LLamaCloudFileService } from "@/cl/app/api/chat/llamaindex/streaming/service";
import { NextResponse } from "next/server";

/**
 * This API is to get config from the backend envs and expose them to the frontend
 */
export async function GET() {
  const config = {
    projects: await LLamaCloudFileService.getAllProjectsWithPipelines(),
  };
  return NextResponse.json(config, { status: 200 });
}
