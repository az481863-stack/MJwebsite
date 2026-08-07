import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { createQrCode } from "../actions";
import { QrCodeForm } from "../qr-form";

export default async function NewQrCodePage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "SUPERADMIN")) redirect("/account");
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">新增 QR Code</h1>
      <QrCodeForm action={createQrCode} />
    </div>
  );
}
