// 某 IP 的對話頁(ADMIN 以上):日期 filter(預設帶入點進來的日期)→ 顯示
// 該 IP 當天與小幫手的完整對話。頁首有封鎖 switch。

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import {
  getConversationForIpDate,
  isIpBlocked,
  normalizeDate,
} from "@/lib/chatlog";
import { DateFilter } from "../date-filter";
import { IpBlockSwitch } from "../ip-block-switch";

export const dynamic = "force-dynamic";

function fmtTime(d: Date): string {
  return d.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

export default async function IpConversationPage({
  params,
  searchParams,
}: {
  params: Promise<{ ip: string }>;
  searchParams: Promise<{ date?: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const ipHash = decodeURIComponent((await params).ip);
  const date = normalizeDate((await searchParams).date);
  const [messages, blocked] = await Promise.all([
    getConversationForIpDate(ipHash, date),
    isIpBlocked(ipHash),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/admin/chat-logs?date=${date}`}
          className="text-sm text-muted underline-offset-2 hover:underline"
        >
          ← 回 IP 列表
        </Link>
        <div className="mt-2 flex items-center justify-between gap-4">
          <h1
            className="truncate font-mono text-xl font-semibold tracking-tight"
            title={ipHash}
          >
            {ipHash === "unknown" ? "unknown" : ipHash.slice(0, 16)}
          </h1>
          <div className="flex shrink-0 items-center gap-2 text-sm text-muted">
            小幫手
            <IpBlockSwitch ipHash={ipHash} initialBlocked={blocked} />
          </div>
        </div>
      </div>

      <DateFilter date={date} />

      {messages.length === 0 ? (
        <p className="rounded-sm border border-line px-4 py-8 text-center text-sm text-muted">
          此 IP 於 {date} 無對話紀錄。
        </p>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const isUser = m.role === "user";
            return (
              <div
                key={m.id}
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                    isUser
                      ? "bg-accent/15 text-foreground"
                      : "border border-line bg-foreground/[0.02] text-foreground"
                  }`}
                >
                  <div className="mb-0.5 flex items-center gap-2 text-xs text-muted">
                    <span>{isUser ? "訪客" : "小幫手"}</span>
                    <span>{fmtTime(m.createdAt)}</span>
                  </div>
                  <p className="whitespace-pre-wrap">{m.text}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
