// 會員顯示名稱:全站優先顯示 name,無則 fallback 至 loginEmail。
// 任何要把會員身分呈現給人看的地方都應走這個 helper(寄信收件人等實際 email 用途除外)。
export function displayName(m: {
  name?: string | null;
  loginEmail: string;
}): string {
  const n = m.name?.trim();
  return n && n.length > 0 ? n : m.loginEmail;
}
