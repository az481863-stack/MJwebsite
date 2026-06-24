import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Next 16 將 middleware 慣例更名為 proxy。負責刷新 Supabase session。
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  // 僅在需要 session 的後台/帳號相關路徑刷新,公開頁面維持靜態、零額外開銷。
  matcher: ["/account/:path*", "/admin/:path*", "/auth/:path*"],
};
