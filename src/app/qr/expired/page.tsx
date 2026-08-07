import type { Metadata } from "next";
import { QrExpiredContent } from "./qr-expired-content";

export const metadata: Metadata = {
  title: "QR Code 已失效",
  robots: { index: false },
};

// /q/<slug> 查無、已刪除或已過期時導向此頁(見 src/app/q/[slug]/route.ts)。
export default function QrExpiredPage() {
  return <QrExpiredContent />;
}
