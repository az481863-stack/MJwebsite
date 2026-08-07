// QR Code 管理的共用邏輯(短碼產生、到期判定、短網址組裝)。
// 設計要點見 prisma schema 的 QrCode 註解:QR 編的是站內 /q/<slug>,
// 掃碼者必經伺服器才可能計數;只累加總次數,不存任何 IP。

import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site";

const TZ_OFFSET_MS = 8 * 60 * 60 * 1000; // 台灣 UTC+8

// 去掉易混淆字元(0/O、1/I/l),避免人工抄寫短網址時看錯。
const ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";
const SLUG_LEN = 6;

function randomSlug(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(SLUG_LEN));
  return Array.from(bytes, (b) => ALPHABET[b % ALPHABET.length]).join("");
}

// 產生未被使用的短碼(碰撞則重抽)。
export async function generateSlug(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const slug = randomSlug();
    const existing = await prisma.qrCode.findUnique({ where: { slug } });
    if (!existing) return slug;
  }
  throw new Error("無法產生短碼,請重試");
}

// 後台以 <input type="date"> 選日期;到期以「台灣時區當日結束」為準,
// 故存的是該日台灣 24:00(= 隔日 00:00)的 UTC 時刻,當下之後即失效。
export function parseExpiryDate(input: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const [y, m, d] = input.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d + 1) - TZ_OFFSET_MS);
}

// 反向:把已存的到期時刻還原成 <input type="date"> 的值(台灣當地日)。
export function formatExpiryDate(date: Date | null): string {
  if (!date) return "";
  const local = new Date(date.getTime() + TZ_OFFSET_MS - 1); // 減 1ms 落回當日
  return local.toISOString().slice(0, 10);
}

export function isExpired(expiresAt: Date | null, now: Date = new Date()): boolean {
  return expiresAt !== null && expiresAt.getTime() <= now.getTime();
}

// QR 圖片與後台複製按鈕都用這個短網址。
export function shortUrl(slug: string): string {
  return `${siteUrl()}/q/${slug}`;
}
