// src/env.mjs
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  /*
   * Serverside Environment variables, not available on the client.
   * Will throw if you access these variables on the client.
   */
  server: {
    OPENAI_API_KEY: z.string().min(1),
    NEXTAUTH_URL: z.string().url().optional(),
    NEXTAUTH_SECRET: z.string().min(1).optional(),
    LINKEDIN_CLIENT_ID: z.string().min(1).optional(),
    LINKEDIN_CLIENT_SECRET: z.string().min(1).optional(),
    SLACK_WEBHOOK_URL: z.string().url().optional(),
  },
  /*
   * Environment variables available on the client (and server).
   *
   * 💡 You'll get type errors if these are not prefixed with NEXT_PUBLIC_.
   */
  client: {
    NEXT_PUBLIC_HAS_NEXTAUTH: z.boolean().optional(),
  },
  /*
   * Due to how Next.js bundles environment variables on Edge and Client,
   * we need to manually destructure them to make sure all are included in bundle.
   *
   * 💡 You'll get type errors if not all variables from `server` & `client` are included here.
   */
  runtimeEnv: {
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
    LINKEDIN_CLIENT_ID: process.env.LINKEDIN_CLIENT_ID,
    LINKEDIN_CLIENT_SECRET: process.env.LINKEDIN_CLIENT_SECRET,
    SLACK_WEBHOOK_URL: process.env.SLACK_WEBHOOK_URL,
    NEXT_PUBLIC_HAS_NEXTAUTH: !!process.env.NEXT_PUBLIC_HAS_NEXTAUTH,
  },
});
