"use server";

// Word 快速新增的「直傳」地基:
// Vercel 函式的請求 body 有 4.5MB 硬上限(無法調整),故大 .docx 不可穿過 server action。
// 這裡只發一個「簽章上傳網址」(極小回應),瀏覽器據此把檔案直傳 Supabase Storage,
// 全程不經 Vercel 函式;之後只把 path 字串交給處理 action 下載解析。

import { getCurrentMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

// 注意:"use server" 檔只能匯出 async 函式,故這兩個常數不可 export(僅供本檔用)。
const DOCX_BUCKET = "media";
const DOCX_PREFIX = "word-uploads";

export interface SignedUploadResult {
  ok: boolean;
  path?: string;
  token?: string;
  message?: string;
}

export async function createDocxUploadUrl(): Promise<SignedUploadResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };

  const admin = createAdminClient();
  // 確保 bucket 存在(已存在則忽略)。
  await admin.storage.createBucket(DOCX_BUCKET, { public: true }).catch(() => {});

  const path = `${DOCX_PREFIX}/${crypto.randomUUID()}.docx`;
  const { data, error } = await admin.storage
    .from(DOCX_BUCKET)
    .createSignedUploadUrl(path);
  if (error || !data) {
    return { ok: false, message: "無法建立上傳連結,請再試一次。" };
  }
  return { ok: true, path: data.path, token: data.token };
}
