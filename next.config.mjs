// import env from "@t3-oss/env-nextjs" to help validate schema on build 
// https://env.t3.gg/docs/nextjs#validate-schema-on-build-(recommended)
import "./app/env.mjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse"],
    outputFileTracingIncludes: {
      "/*": ["./cache/**/*"],
    },
  },
};

export default nextConfig;
