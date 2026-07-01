// 前台小幫手對話管理頁(ADMIN 以上):日期 filter(預設今日)→ 列出當天
// 與小幫手對話過的所有 IP;點 IP 進對話頁。每個 IP 旁有封鎖 switch。

import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { listChatIpsForDate, normalizeDate, todayTaiwan } from "@/lib/chatlog";
import { DateFilter } from "./date-filter";
import { IpBlockSwitch } from "./ip-block-switch";

export const dynamic = "force-dynamic";

function fmtTime(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleString("zh-TW", {
    timeZone: "Asia/Taipei",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function ChatLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const date = normalizeDate((await searchParams).date);
  const rows = await listChatIpsForDate(date);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">小幫手對話紀錄</h1>
        <p className="mt-1 text-sm text-muted">
          選日期查看當天與前台小幫手對話過的訪客;點識別碼看完整對話。右側開關預設開啟,
          關閉後該訪客進站將看不到小幫手。
          <br />
          🔒 為保護隱私,系統只存「雜湊後的識別碼」不存真實 IP,無法還原。
          ⚠️ 同一 IP 常多人共用且會變動,僅供粗略檢視與軟性勸退,非可靠識別或封鎖。
        </p>
      </div>

      <DateFilter date={date} />

      {rows.length === 0 ? (
        <p className="rounded-sm border border-line px-4 py-8 text-center text-sm text-muted">
          {date === todayTaiwan() ? "今天" : date} 尚無對話紀錄。
        </p>
      ) : (
        <div className="overflow-hidden rounded-sm border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-foreground/[0.02] text-left text-xs uppercase tracking-wider text-muted">
                <th className="px-4 py-2 font-medium">訪客識別碼(雜湊)</th>
                <th className="px-4 py-2 font-medium">訊息數</th>
                <th className="px-4 py-2 font-medium">最後對話</th>
                <th className="px-4 py-2 text-right font-medium">小幫手</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.ipHash} className="border-b border-line last:border-0">
                  <td className="px-4 py-2">
                    <Link
                      href={`/admin/chat-logs/${encodeURIComponent(r.ipHash)}?date=${date}`}
                      className="font-mono text-foreground underline-offset-2 hover:underline"
                      title={r.ipHash}
                    >
                      {r.ipHash === "unknown" ? "unknown" : r.ipHash.slice(0, 12)}
                    </Link>
                    {r.blocked && (
                      <span className="ml-2 rounded-sm bg-red-500/10 px-1.5 py-0.5 text-xs text-red-600">
                        已封鎖
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-muted">{r.count}</td>
                  <td className="px-4 py-2 text-muted">{fmtTime(r.lastAt)}</td>
                  <td className="px-4 py-2">
                    <div className="flex justify-end">
                      <IpBlockSwitch ipHash={r.ipHash} initialBlocked={r.blocked} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
