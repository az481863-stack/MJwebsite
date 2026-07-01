// 階段五排程入口:由 GitHub Actions 定時(每 15 分)以 Bearer CRON_SECRET 呼叫。
// 執行儀器預約對帳(自動簽到 + 標記逾時)。頁面載入也會 lazy 對帳,此處為備援保證。

import { NextResponse } from "next/server";
import { reconcile } from "@/lib/instruments";
import { purgeOldRateHits } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// 限流計數保留期:略長於最長窗(1 個月),回收離開後不再出現的 IP 舊列。
const RATE_HIT_TTL_MS = 32 * 24 * 60 * 60 * 1000;

export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    // 未設密語時拒絕,避免端點裸奔。
    return NextResponse.json({ error: "CRON_SECRET 未設定" }, { status: 503 });
  }
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "未授權" }, { status: 401 });
  }

  const result = await reconcile();
  const purged = await purgeOldRateHits(RATE_HIT_TTL_MS);
  return NextResponse.json({
    ok: true,
    ...result,
    purgedRateHits: purged,
    at: new Date().toISOString(),
  });
}
