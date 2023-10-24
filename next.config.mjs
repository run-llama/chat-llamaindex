/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["pdf-parse", "llamaindex"],
    outputFileTracingIncludes: {
      "/*": ["./cache/**/*"],
    },
  },
};

export default nextConfig;
