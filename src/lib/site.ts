// 站台基底網址(組邀請連結、OAuth redirect 用)。
export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}
