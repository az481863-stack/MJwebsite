import Link from "next/link";
import { redirect } from "next/navigation";
import QRCode from "qrcode";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isExpired, shortUrl } from "@/lib/qrcodes";
import {
  CopyUrlButton,
  DeleteQrCodeButton,
  DownloadQrButton,
} from "./row-actions";

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return new Date(d).toLocaleDateString("zh-TW", {
    timeZone: "Asia/Taipei",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function QrCodesAdminPage() {
  const me = await getCurrentMember();
  if (!me) redirect("/login");
  if (!roleAtLeast(me.role, "SUPERADMIN")) redirect("/admin");

  const codes = await prisma.qrCode.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
  });

  const now = new Date();
  const rows = await Promise.all(
    codes.map(async (qr) => ({
      ...qr,
      url: shortUrl(qr.slug),
      expired: isExpired(qr.expiresAt, now),
      // QR 圖片於 server 端產生 data URL(沿用儀器簽退 QR 的做法,無新依賴)。
      qrDataUrl: await QRCode.toDataURL(shortUrl(qr.slug), {
        width: 320,
        margin: 1,
      }),
    })),
  );

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">QR Code 管理</h1>
        <Link
          href="/admin/qr-codes/new"
          className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          + 新增 QR Code
        </Link>
      </div>
      <p className="mt-2 text-sm text-muted">
        QR 圖片編的是本站短網址,掃碼者先經過本站才轉往目標網址——這是掃描次數得以計數的原因。
        因此目標網址可隨時修改,已印出的 QR Code 不必重印。
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted">尚未建立任何 QR Code。</p>
      ) : (
        <ul className="mt-8 divide-y divide-line border-y border-line">
          {rows.map((qr) => (
            <li key={qr.id} className="flex flex-col gap-4 py-6 sm:flex-row">
              {/* eslint-disable-next-line @next/next/no-img-element -- data URL,非遠端圖片 */}
              <img
                src={qr.qrDataUrl}
                alt={`${qr.label} 的 QR Code`}
                className="h-28 w-28 shrink-0 border border-line"
              />

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-base font-semibold">{qr.label}</h2>
                  {qr.expired && (
                    <span className="border border-red-500 px-1.5 py-0.5 text-xs font-medium text-red-600">
                      已過期
                    </span>
                  )}
                </div>

                <p className="mt-1 break-all font-mono text-xs text-muted">{qr.url}</p>
                <p className="mt-1 break-all text-sm">
                  <span className="text-muted">目標:</span>
                  <a
                    href={qr.targetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline-offset-4 hover:underline"
                  >
                    {qr.targetUrl}
                  </a>
                </p>

                <p className="mt-2 text-sm">
                  <span className="text-muted">掃描次數:</span>
                  <span className="ml-1 text-lg font-semibold text-accent">
                    {qr.scanCount}
                  </span>
                  <span className="ml-4 text-muted">到期日:</span>
                  <span className={`ml-1 ${qr.expired ? "text-red-600" : ""}`}>
                    {qr.expiresAt ? fmtDate(qr.expiresAt) : "永久有效"}
                  </span>
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CopyUrlButton url={qr.url} />
                  <DownloadQrButton dataUrl={qr.qrDataUrl} filename={qr.slug} />
                  <Link
                    href={`/admin/qr-codes/${qr.id}`}
                    className="border border-line-strong px-3 py-1 text-xs font-medium transition-colors hover:bg-foreground hover:text-background"
                  >
                    編輯
                  </Link>
                  <DeleteQrCodeButton id={qr.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
