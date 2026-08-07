"use server";

// QR Code 管理 server action。全部限最高權限者(SUPERADMIN)。
// 短碼(slug)於建立時產生後即不可改——QR 可能已印出貼在現場,改了會全數失效;
// 需要換目的地時改 targetUrl 即可,QR 不必重印。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateSlug, parseExpiryDate } from "@/lib/qrcodes";

export interface ActionResult {
  ok: boolean;
  message: string;
}

function parse(formData: FormData) {
  return {
    label: String(formData.get("label") ?? "").trim(),
    targetUrl: String(formData.get("targetUrl") ?? "").trim(),
    expiresAtRaw: String(formData.get("expiresAt") ?? "").trim(),
  };
}

// 只接受 http/https 絕對網址:轉址端點會直接把它丟給瀏覽器,
// 擋掉 javascript: 之類的 scheme,也避免相對路徑導到怪地方。
function validateUrl(url: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return "目標網址格式不正確,請包含 https:// 或 http://。";
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
    return "目標網址只接受 http:// 或 https:// 開頭。";
  return null;
}

export async function createQrCode(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "SUPERADMIN"))
    return { ok: false, message: "權限不足。" };

  const f = parse(formData);
  if (!f.label || !f.targetUrl)
    return { ok: false, message: "請填寫名稱與目標網址。" };
  const urlErr = validateUrl(f.targetUrl);
  if (urlErr) return { ok: false, message: urlErr };

  const expiresAt = f.expiresAtRaw ? parseExpiryDate(f.expiresAtRaw) : null;
  if (f.expiresAtRaw && !expiresAt)
    return { ok: false, message: "到期日格式不正確。" };

  await prisma.qrCode.create({
    data: {
      slug: await generateSlug(),
      label: f.label,
      targetUrl: f.targetUrl,
      expiresAt,
      createdBy: me.id,
      updatedBy: me.id,
    },
  });

  revalidatePath("/admin/qr-codes");
  redirect("/admin/qr-codes");
}

export async function updateQrCode(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "SUPERADMIN"))
    return { ok: false, message: "權限不足。" };

  const id = String(formData.get("id") ?? "");
  const f = parse(formData);
  if (!id || !f.label || !f.targetUrl)
    return { ok: false, message: "請填寫名稱與目標網址。" };
  const urlErr = validateUrl(f.targetUrl);
  if (urlErr) return { ok: false, message: urlErr };

  const expiresAt = f.expiresAtRaw ? parseExpiryDate(f.expiresAtRaw) : null;
  if (f.expiresAtRaw && !expiresAt)
    return { ok: false, message: "到期日格式不正確。" };

  await prisma.qrCode.update({
    where: { id },
    data: {
      label: f.label,
      targetUrl: f.targetUrl,
      expiresAt,
      updatedBy: me.id,
    },
  });

  revalidatePath("/admin/qr-codes");
  redirect("/admin/qr-codes");
}

// 軟刪除(D:全站無永久刪除)。刪除後掃碼視同失效,導向 /qr/expired。
export async function softDeleteQrCode(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "SUPERADMIN"))
    return { ok: false, message: "權限不足。" };

  const id = String(formData.get("id") ?? "");
  if (!id) return { ok: false, message: "缺少項目 ID。" };

  await prisma.qrCode.update({
    where: { id },
    data: { deletedAt: new Date(), deletedBy: me.id },
  });

  revalidatePath("/admin/qr-codes");
  return { ok: true, message: "已刪除。" };
}
