"use server";

// 聯絡表單送出(階段四):驗證 → 蜜罐 → 速率限制 → 依分類寄信。
// 回傳的 message 為「字典 key」,由前台依語系對應顯示文案。

import { headers } from "next/headers";
import { sendContactEmail } from "@/lib/email";

export interface ContactResult {
  ok: boolean;
  message: string; // dictionary key: success / errRequired / errEmail / errCategory / errRate / errGeneric
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CATEGORIES = ["industry", "academic", "recruit"];

// 簡易記憶體速率限制(每 IP)。注意:serverless 多實例/冷啟動下非全域共享,
// 屬規格要求的「基本防灌」;搭配蜜罐欄位擋掉多數自動化機器人。
const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 3;
const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.set(ip, arr);
  if (arr.length >= MAX_PER_WINDOW) return true;
  arr.push(now);
  return false;
}

export async function submitContact(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  // 蜜罐:隱藏欄位若被填寫,視為機器人 → 佯裝成功、不寄信。
  if (String(formData.get("company") ?? "").trim() !== "") {
    return { ok: true, message: "success" };
  }

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const category = String(formData.get("category") ?? "");
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) return { ok: false, message: "errRequired" };
  if (!CATEGORIES.includes(category)) return { ok: false, message: "errCategory" };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "errEmail" };

  // 速率限制(取 x-forwarded-for 第一段為 IP)。
  const hdrs = await headers();
  const ip =
    (hdrs.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return { ok: false, message: "errRate" };

  const recipients = (process.env.CONTACT_RECIPIENTS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (recipients.length === 0) {
    console.error("[contact] CONTACT_RECIPIENTS 未設定,無法寄送");
    return { ok: false, message: "errGeneric" };
  }

  try {
    await sendContactEmail({ recipients, category, name, email, message });
    return { ok: true, message: "success" };
  } catch (e) {
    console.error("[contact] 寄送失敗", e);
    return { ok: false, message: "errGeneric" };
  }
}
