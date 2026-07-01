// 前台小幫手對話留存 + IP 封鎖(見 CLAUDE.md 階段七後記)。
// 對話 90 天由 cron 清理;IP 為弱識別,封鎖屬軟性勸退。
// 所有寫入採 fire-and-forget 內建 try/catch:紀錄失敗不得影響聊天本身。

import { prisma } from "@/lib/prisma";

// 台灣 UTC+8(無日光節約),後台日期 filter 一律以台灣當地日計。
const TZ_OFFSET_MS = 8 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// 台灣當地「今天」的 YYYY-MM-DD。
export function todayTaiwan(): string {
  return new Date(Date.now() + TZ_OFFSET_MS).toISOString().slice(0, 10);
}

// 把「台灣當地某日(YYYY-MM-DD)」換成 UTC 的 [start, end) 區間。
export function taiwanDayRangeUtc(dateStr: string): { start: Date; end: Date } {
  const [y, m, d] = dateStr.split("-").map(Number);
  // 台灣 00:00 = 該 UTC 日期減 8 小時
  const startMs = Date.UTC(y, m - 1, d) - TZ_OFFSET_MS;
  return { start: new Date(startMs), end: new Date(startMs + DAY_MS) };
}

// 驗證/正規化日期字串,非法則回今天(台灣)。
export function normalizeDate(input: string | undefined | null): string {
  if (input && /^\d{4}-\d{2}-\d{2}$/.test(input)) return input;
  return todayTaiwan();
}

// ── 寫入 ──────────────────────────────────────────────────────

export async function logChatMessage(
  ip: string,
  role: "user" | "model",
  text: string,
  lang: "zh" | "en",
): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return;
  try {
    await prisma.chatLog.create({ data: { ip, role, text: trimmed, lang } });
  } catch (err) {
    console.error("[chatlog] write failed:", err);
  }
}

// ── IP 封鎖 ───────────────────────────────────────────────────

// 該 IP 是否被封鎖(看不到小幫手)。查詢失敗一律視為未封鎖(fail-open)。
export async function isIpBlocked(ip: string): Promise<boolean> {
  if (!ip || ip === "unknown") return false;
  try {
    const row = await prisma.ipBlock.findUnique({ where: { ip } });
    return row?.blocked === true;
  } catch (err) {
    console.error("[chatlog] isIpBlocked failed:", err);
    return false;
  }
}

// 設定封鎖狀態(blocked=true 擋、false 放行)。供後台 switch 使用。
export async function setIpBlocked(ip: string, blocked: boolean): Promise<void> {
  await prisma.ipBlock.upsert({
    where: { ip },
    create: { ip, blocked },
    update: { blocked },
  });
}

// ── 後台查詢 ──────────────────────────────────────────────────

export interface ChatIpSummary {
  ip: string;
  count: number; // 當日訊息數
  lastAt: Date | null; // 當日最後一則時間
  blocked: boolean; // 是否已封鎖
}

// 某台灣日期,所有與小幫手對話過的 IP(含訊息數、最後時間、封鎖狀態)。
export async function listChatIpsForDate(dateStr: string): Promise<ChatIpSummary[]> {
  const { start, end } = taiwanDayRangeUtc(dateStr);
  const groups = await prisma.chatLog.groupBy({
    by: ["ip"],
    where: { createdAt: { gte: start, lt: end } },
    _count: { _all: true },
    _max: { createdAt: true },
  });
  const ips = groups.map((g) => g.ip);
  const blocks =
    ips.length > 0
      ? await prisma.ipBlock.findMany({ where: { ip: { in: ips } } })
      : [];
  const blockedSet = new Set(blocks.filter((b) => b.blocked).map((b) => b.ip));

  return groups
    .map((g) => ({
      ip: g.ip,
      count: g._count._all,
      lastAt: g._max.createdAt,
      blocked: blockedSet.has(g.ip),
    }))
    .sort((a, b) => (b.lastAt?.getTime() ?? 0) - (a.lastAt?.getTime() ?? 0));
}

export interface ChatLogEntry {
  id: string;
  role: string;
  text: string;
  lang: string;
  createdAt: Date;
}

// 某 IP 於某台灣日期的所有對話(時間正序)。
export async function getConversationForIpDate(
  ip: string,
  dateStr: string,
): Promise<ChatLogEntry[]> {
  const { start, end } = taiwanDayRangeUtc(dateStr);
  return prisma.chatLog.findMany({
    where: { ip, createdAt: { gte: start, lt: end } },
    orderBy: { createdAt: "asc" },
    select: { id: true, role: true, text: true, lang: true, createdAt: true },
  });
}

// ── 清理(cron)────────────────────────────────────────────────

export async function purgeOldChatLogs(olderThanMs: number): Promise<number> {
  try {
    const res = await prisma.chatLog.deleteMany({
      where: { createdAt: { lt: new Date(Date.now() - olderThanMs) } },
    });
    return res.count;
  } catch (err) {
    console.error("[chatlog] purge failed:", err);
    return 0;
  }
}
