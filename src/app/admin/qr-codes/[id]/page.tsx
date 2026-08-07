import { notFound, redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatExpiryDate, shortUrl } from "@/lib/qrcodes";
import { updateQrCode } from "../actions";
import { QrCodeForm } from "../qr-form";

export const dynamic = "force-dynamic";

export default async function EditQrCodePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "SUPERADMIN")) redirect("/account");
  const { id } = await params;
  const qr = await prisma.qrCode.findUnique({ where: { id } });
  if (!qr || qr.deletedAt) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">編輯 QR Code</h1>
      <div className="max-w-xl border border-line px-4 py-3 text-sm">
        <p className="text-muted">
          短網址(QR 圖片內容,不可更改):
          <span className="ml-1 font-mono text-foreground">{shortUrl(qr.slug)}</span>
        </p>
        <p className="mt-1 text-muted">
          目前掃描次數:<span className="font-semibold text-foreground">{qr.scanCount}</span>
        </p>
      </div>
      <QrCodeForm
        action={updateQrCode}
        initial={{
          id: qr.id,
          label: qr.label,
          targetUrl: qr.targetUrl,
          expiresAt: formatExpiryDate(qr.expiresAt),
        }}
      />
    </div>
  );
}
