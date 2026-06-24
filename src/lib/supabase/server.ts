// 伺服器端 Supabase client(供 server component / route handler / server action 使用)。
// 以 cookie 維持使用者 session,走 anon key。

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          // 在 server component 內呼叫 set 會丟錯(無法改 header),
          // 由 middleware 負責刷新 cookie,故此處吞掉錯誤即可。
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // server component 渲染期間忽略
          }
        },
      },
    },
  );
}
