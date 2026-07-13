// .docx 解析(階段六):用 mammoth 把 Word 抽成全文(不截斷、不摘要)再整份丟 Gemini。
// Gemini 無法直接吃 .docx 二進位,故先轉純文字。僅供 server 端使用。

import mammoth from "mammoth";
import { createAdminClient } from "@/lib/supabase/admin";

export interface DocxResult {
  text: string;
  hadImages: boolean;
}

// 直傳流程:瀏覽器已把 .docx 傳上 Storage,這裡依 path 取回成 Buffer 並隨即刪除暫存檔。
// 只允許 word-uploads/ 前綴,避免被拿來下載任意檔案。
export async function fetchUploadedDocx(path: string): Promise<Buffer> {
  if (!path.startsWith("word-uploads/") || !path.toLowerCase().endsWith(".docx"))
    throw new Error("上傳路徑無效。");

  const admin = createAdminClient();
  const { data, error } = await admin.storage.from("media").download(path);
  if (error || !data) throw new Error("讀取上傳檔失敗,請再試一次。");

  const buffer = Buffer.from(await data.arrayBuffer());
  // 內容已在記憶體,暫存檔即可刪除(成功/解析失敗都不留垃圾)。
  await admin.storage.from("media").remove([path]).catch(() => {});
  return buffer;
}

export async function extractDocxText(buffer: Buffer): Promise<DocxResult> {
  const { value } = await mammoth.extractRawText({ buffer });
  const text = value.trim();
  if (!text) throw new Error("無法從此 Word 檔讀到文字內容。");

  // 偵測是否含圖片(供 Blog 在內文插入「請補圖」提示)。
  // convertToHtml 對每張內嵌圖會輸出 <img>;以此判斷。
  let hadImages = false;
  try {
    const html = await mammoth.convertToHtml({ buffer });
    hadImages = /<img/i.test(html.value);
  } catch {
    hadImages = false;
  }

  return { text, hadImages };
}
