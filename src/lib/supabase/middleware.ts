// Session 刷新中介層(@supabase/ssr 官方建議模式)。
// 於每次請求刷新 auth token 並同步 cookie,確保 server component 能讀到最新 session。

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 重要:勿在 createServerClient 與 getUser() 之間插入其他邏輯,
  // 否則可能造成 session 隨機登出(官方警告)。
  await supabase.auth.getUser();

  return supabaseResponse;
}
