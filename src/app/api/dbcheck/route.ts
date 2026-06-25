// 暫時性診斷端點:回報 Vercel runtime 連 Supabase 的真實結果。
// 用途:排查部署後 DB 頁 500 的根因(P1001 連不上 / 認證失敗 / engine 缺失…)。
// ⚠️ 排查完請刪除此檔(會洩漏少量連線資訊)。
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function mask(url: string | undefined) {
  if (!url) return null;
  return url.replace(/:\/\/([^:]+):[^@]*@/, "://$1:****@");
}

export async function GET() {
  const started = Date.now();
  try {
    const rows = await prisma.$queryRaw`select now() as now`;
    return NextResponse.json({
      ok: true,
      ms: Date.now() - started,
      rows,
      databaseUrl: mask(process.env.DATABASE_URL),
    });
  } catch (e) {
    const err = e as { message?: string; code?: string; name?: string };
    return NextResponse.json(
      {
        ok: false,
        ms: Date.now() - started,
        name: err.name,
        code: err.code,
        message: err.message,
        // 只揭露 host:port,不含密碼,便於確認 Vercel 實際吃到的連線目標
        databaseUrl: mask(process.env.DATABASE_URL),
        hasDirectUrl: Boolean(process.env.DIRECT_URL),
      },
      { status: 200 },
    );
  }
}
