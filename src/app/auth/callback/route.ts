// OAuth 回呼(Google 登入):以 code 換 session,並驗證對應到有效會員。
// 非會員(未受邀)登入一律登出拒絕,維持「邀請制」(C-1)。

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/account";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const member = await prisma.member.findFirst({
          where: { authUserId: user.id, deletedAt: null },
        });
        if (member && member.status === "ACTIVE") {
          return NextResponse.redirect(`${origin}${next}`);
        }
      }
      // 非有效會員 → 登出拒絕。
      await supabase.auth.signOut();
      return NextResponse.redirect(`${origin}/login?error=not_member`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
