import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prisma client 產在自訂路徑 src/generated/prisma;Next 預設的 file tracing
  // 不會把 query engine(.so.node)複製進 serverless function,導致 Vercel runtime
  // 報「engine not found for rhel-openssl-3.0.x」。明確要求把引擎一併打包。
  outputFileTracingIncludes: {
    "/**": ["./src/generated/prisma/**/*"],
  },
};

export default nextConfig;
