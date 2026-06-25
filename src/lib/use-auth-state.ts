"use client";

// 前台導覽列用的輕量登入狀態(client 端判斷,讓公開頁面維持靜態、不必每次打 DB)。
// 僅判斷是否有 session;真正的會員有效性由 /account、/admin 頁面伺服器端把關。

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function useAuthState(): boolean {
  const [authed, setAuthed] = useState(false);
  // 密碼登入/登出走 server action(改的是 server 端 cookie),瀏覽器端的
  // onAuthStateChange 不會觸發。改為「每次路由變動」重讀一次 session,
  // 讓登入後導向 /account、登出後導向 /login 時 navbar 立即更新。
  const pathname = usePathname();

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (active) setAuthed(!!data.session);
    });
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthed(!!session);
    });
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  return authed;
}
