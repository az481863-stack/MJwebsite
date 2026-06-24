// Admin Supabase client(service role key,僅限伺服器端!切勿在 client 匯入)。
// 用於需繞過 RLS 的管理操作:建立 auth 使用者、設定密碼、刪除帳號等。

import { createClient } from "@supabase/supabase-js";

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  );
}
