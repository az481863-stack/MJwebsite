// 瀏覽器端 Supabase client(供 client component 使用,如登入、綁 Google)。
// 走 anon key,受 RLS 與 Auth 規則約束。

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
