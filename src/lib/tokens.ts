// 邀請 token 工具(C-3:隨機 token、僅存雜湊、勿存明碼)。
// 連結帶明碼 token,資料庫只存 SHA-256 雜湊;查找時比對雜湊。

import { createHash, randomBytes } from "crypto";

export function generateInviteToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("base64url");
  return { raw, hash: hashToken(raw) };
}

export function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

// 邀請有效期(C-3:建議 7 天)。
export const INVITE_TTL_DAYS = 7;

export function inviteExpiry(from: Date = new Date()): Date {
  return new Date(from.getTime() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);
}
