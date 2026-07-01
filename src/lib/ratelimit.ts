// 多段速率限制(DB 持久化,跨 serverless 實例/冷啟動皆準)。
// 同一 IP 依多個時間窗各自設上限;任一窗超限即擋下。長窗(日/月)靠 DB 才有意義
// (記憶體版冷啟動即歸零,見 CLAUDE.md 防濫用取捨)。
// 設計:每次通過的請求於 rate_hits 記一列;查詢時抓「最長窗內」的列,於記憶體分窗計數。
// 失敗策略=fail-open:限流本身的 DB 讀寫若出錯,放行但記 log,不因限流故障拖垮聊天
//   (燒錢攻擊另有 Google 端月花費上限兜底)。

import { prisma } from "@/lib/prisma";

export interface RateWindow {
  ms: number; // 時間窗長度(毫秒)
  max: number; // 該窗內同一 IP 的上限次數
  label: string; // 供錯誤訊息/log 辨識
}

// 前台聊天預設:同一 IP 每小時 50、每 6 小時 100、每日 150、每月 500。
export const CHAT_RATE_WINDOWS: RateWindow[] = [
  { ms: 60 * 60 * 1000, max: 50, label: "hour" },
  { ms: 6 * 60 * 60 * 1000, max: 100, label: "6h" },
  { ms: 24 * 60 * 60 * 1000, max: 150, label: "day" },
  { ms: 30 * 24 * 60 * 60 * 1000, max: 500, label: "month" },
];

export interface RateResult {
  ok: boolean;
  window?: string; // 被擋時,是哪個窗超限
}

// 檢查並(若通過)記錄一次請求。回傳 ok=false 代表已超限、不應處理該請求。
// ipHash = 已雜湊的 IP(見 src/lib/iphash.ts),此處僅當作不透明的計數鍵。
export async function checkRateLimit(
  scope: string,
  ipHash: string,
  windows: RateWindow[] = CHAT_RATE_WINDOWS,
): Promise<RateResult> {
  const now = Date.now();
  const longest = Math.max(...windows.map((w) => w.ms));
  const since = new Date(now - longest);

  let rows: { createdAt: Date }[];
  try {
    rows = await prisma.rateHit.findMany({
      where: { scope, ipHash, createdAt: { gt: since } },
      select: { createdAt: true },
    });
  } catch (err) {
    // 限流查詢失敗不阻斷服務(fail-open),但保留 log 供追查。
    console.error("[ratelimit] query failed:", err);
    return { ok: true };
  }

  // 逐窗計數:落在該窗內的既有列數若已達上限,擋下本次請求。
  for (const w of windows) {
    const from = now - w.ms;
    const count = rows.reduce(
      (n, r) => (r.createdAt.getTime() > from ? n + 1 : n),
      0,
    );
    if (count >= w.max) return { ok: false, window: w.label };
  }

  // 通過 → 記一次;順帶清掉此鍵超過最長窗的舊列,控制單一 IP 的資料成長。
  try {
    await prisma.rateHit.create({ data: { scope, ipHash } });
    await prisma.rateHit.deleteMany({
      where: { scope, ipHash, createdAt: { lt: since } },
    });
  } catch (err) {
    console.error("[ratelimit] write failed:", err);
  }

  return { ok: true };
}

// 唯讀檢查:目前是否已達任一窗上限(不記錄、不寫入)。供 layout 決定是否隱藏小幫手
//（「到達上限即隱藏」)。查詢失敗一律回 false(fail-open,不誤藏)。
export async function isRateLimited(
  scope: string,
  ipHash: string,
  windows: RateWindow[] = CHAT_RATE_WINDOWS,
): Promise<boolean> {
  if (!ipHash || ipHash === "unknown") return false;
  const now = Date.now();
  const longest = Math.max(...windows.map((w) => w.ms));
  const since = new Date(now - longest);

  let rows: { createdAt: Date }[];
  try {
    rows = await prisma.rateHit.findMany({
      where: { scope, ipHash, createdAt: { gt: since } },
      select: { createdAt: true },
    });
  } catch (err) {
    console.error("[ratelimit] isRateLimited query failed:", err);
    return false;
  }

  for (const w of windows) {
    const from = now - w.ms;
    const count = rows.reduce(
      (n, r) => (r.createdAt.getTime() > from ? n + 1 : n),
      0,
    );
    if (count >= w.max) return true;
  }
  return false;
}

// 全域清理:刪除所有超過指定天數的舊列(由 cron 定期呼叫,回收離開後不再出現的 IP)。
export async function purgeOldRateHits(olderThanMs: number): Promise<number> {
  try {
    const res = await prisma.rateHit.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - olderThanMs) } },
    });
    return res.count;
  } catch (err) {
    console.error("[ratelimit] purge failed:", err);
    return 0;
  }
}
