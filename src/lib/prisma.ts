import { PrismaClient } from "@/generated/prisma/client";

// 開發模式下 Next.js 熱重載會反覆 new PrismaClient,導致連線爆量。
// 以 globalThis 快取單一實例避開此問題。
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
