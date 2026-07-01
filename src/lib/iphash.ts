// 以「帶密鑰(pepper)的 SHA-256」雜湊 IP。
// 為什麼要密鑰:IPv4 僅 2^32 種,單純雜湊可被暴力枚舉反推,等於沒雜湊;加上只有
// 伺服器知道的密鑰後,DB 即使外洩也無法還原真實 IP —— 這才真正避免「IP↔對話」
// 的個資風險。密鑰由環境變數 IP_HASH_SECRET 提供。
//
// 一致性:同一 IP + 同一密鑰 → 同一雜湊,故分組/封鎖/限流照常運作,只是不可逆。
// ⚠️ 若日後更換 IP_HASH_SECRET,既有雜湊全部對不上(封鎖清單、對話分組會「重置」)。
//
// 開發便利:未設 IP_HASH_SECRET 時退回不安全的開發預設並警告;正式站務必設定
// (見 docs/env-vars.md、.env.example)。

import { createHash } from "crypto";

let warned = false;

export function hashIp(rawIp: string | null | undefined): string {
  const ip = (rawIp ?? "").split(",")[0].trim();
  // 取不到 IP 時回 sentinel(不雜湊):下游對 "unknown" 有特別處理(不封鎖等)。
  if (!ip || ip === "unknown") return "unknown";

  let secret = process.env.IP_HASH_SECRET;
  if (!secret) {
    if (!warned) {
      console.warn(
        "[iphash] IP_HASH_SECRET 未設定,使用開發預設密鑰(正式站請務必設定)",
      );
      warned = true;
    }
    secret = "dev-insecure-pepper";
  }
  return createHash("sha256").update(`${secret}:${ip}`).digest("hex");
}
