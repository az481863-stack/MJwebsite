// QR Code 轉址端點:掃碼者一律先到這裡,計數後才導向目標網址。
// 這是「能計數」的唯一理由——QR 若直接編目標網址,請求不經伺服器即無從計數。
// 查無/已刪除/已過期 → 導向 /qr/expired 說明頁(而非 404,對掃到的人較友善)。

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { isExpired } from "@/lib/qrcodes";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  const qr = await prisma.qrCode.findFirst({
    where: { slug, deletedAt: null },
    select: { id: true, targetUrl: true, expiresAt: true },
  });

  if (!qr || isExpired(qr.expiresAt)) {
    return NextResponse.redirect(new URL("/qr/expired", _req.url), {
      status: 302,
      headers: { "Cache-Control": "no-store" },
    });
  }

  // 計數失敗不得擋住轉址(使用者體驗優先於統計精準)。
  try {
    await prisma.qrCode.update({
      where: { id: qr.id },
      data: { scanCount: { increment: 1 } },
    });
  } catch (err) {
    console.error("[qr] scan count failed:", err);
  }

  // no-store:避免瀏覽器/CDN 快取這個 302,否則第二次掃碼就不會回到伺服器、漏計。
  return NextResponse.redirect(qr.targetUrl, {
    status: 302,
    headers: { "Cache-Control": "no-store" },
  });
}
