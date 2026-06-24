"use server";

// 圖片上傳(共用):任何登入會員可上傳(學生也要傳 Blog 封面)。
// 經 client 端壓縮後送來,這裡用 admin client 上傳至 Supabase Storage 公開 bucket,回傳公開網址。

import { getCurrentMember } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "media";
const MAX_BYTES = 5 * 1024 * 1024; // 5MB(壓縮後應遠小於此)

export interface UploadResult {
  ok: boolean;
  url?: string;
  message?: string;
}

const EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function uploadImage(formData: FormData): Promise<UploadResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };

  const file = formData.get("file");
  const folder = String(formData.get("folder") ?? "misc").replace(
    /[^a-z0-9_-]/gi,
    "",
  );

  if (!(file instanceof File)) {
    return { ok: false, message: "找不到檔案。" };
  }
  if (!file.type.startsWith("image/")) {
    return { ok: false, message: "只接受圖片檔。" };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: "圖片過大(壓縮後仍超過 5MB)。" };
  }

  const admin = createAdminClient();

  // 確保 bucket 存在(已存在則忽略錯誤)。
  await admin.storage.createBucket(BUCKET, { public: true }).catch(() => {});

  const ext = EXT[file.type] ?? "bin";
  const path = `${folder || "misc"}/${crypto.randomUUID()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await admin.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: false });
  if (error) {
    return { ok: false, message: "上傳失敗,請再試一次。" };
  }

  const { data } = admin.storage.from(BUCKET).getPublicUrl(path);
  return { ok: true, url: data.publicUrl };
}
