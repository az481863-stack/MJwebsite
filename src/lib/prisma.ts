import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// 採用 client engine(見 schema.prisma 的 engineType = "client"):無原生 query
// engine,連線改由 driver adapter 經 node-postgres 建立。應用程式執行期走 Supabase
// 連線池(DATABASE_URL,port 6543)。
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });

// 開發模式下 Next.js 熱重載會反覆 new PrismaClient,導致連線爆量。
// 以 globalThis 快取單一實例避開此問題。
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
