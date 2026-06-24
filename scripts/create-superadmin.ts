// 建立「首位最高權限者」(B:最高權限者不從邀請產生)。
// 用法:npx tsx scripts/create-superadmin.ts <email> <password>
//   或設定環境變數 SUPERADMIN_EMAIL / SUPERADMIN_PASSWORD 後直接執行。
//
// 會在 Supabase Auth 建立帳號(密碼登入),並建立/升級對應 Member 為 SUPERADMIN + ACTIVE。

import "dotenv/config";
import { createClient } from "@supabase/supabase-js";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const email = (process.argv[2] ?? process.env.SUPERADMIN_EMAIL ?? "")
    .trim()
    .toLowerCase();
  const password = process.argv[3] ?? process.env.SUPERADMIN_PASSWORD ?? "";

  if (!email || !password) {
    console.error(
      "用法:npx tsx scripts/create-superadmin.ts <email> <password>",
    );
    process.exit(1);
  }
  if (password.length < 8) {
    console.error("密碼至少需 8 個字元。");
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.error("缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY。");
    process.exit(1);
  }

  const admin = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const prisma = new PrismaClient();

  // 1. 建立 Supabase auth 使用者。
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error || !data.user) {
    console.error(
      "建立 Supabase 帳號失敗(可能已存在):",
      error?.message ?? "unknown",
    );
    process.exit(1);
  }
  const authUserId = data.user.id;

  // 2. 建立或升級 Member。
  const existing = await prisma.member.findUnique({ where: { loginEmail: email } });
  if (existing) {
    await prisma.member.update({
      where: { id: existing.id },
      data: { role: "SUPERADMIN", status: "ACTIVE", authUserId },
    });
    console.log(`已將既有會員 ${email} 升級為最高權限者。`);
  } else {
    await prisma.member.create({
      data: {
        loginEmail: email,
        role: "SUPERADMIN",
        status: "ACTIVE",
        authUserId,
      },
    });
    console.log(`已建立最高權限者 ${email}。`);
  }

  await prisma.$disconnect();
  console.log("完成,可用此 email + 密碼登入。");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
