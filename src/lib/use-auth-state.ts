"use client";

// 前台導覽列用的輕量登入狀態(client 端判斷,讓公開頁面維持靜態、不必每次打 DB)。
// 僅判斷是否有 session;真正的會員有效性由 /account、/admin 頁面伺服器端把關。

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useAuthState(): boolean {
  const [authed, setAuthed] = useState(false);

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
  }, []);

  return authed;
}
