// .docx 解析(階段六):用 mammoth 把 Word 抽成全文(不截斷、不摘要)再整份丟 Gemini。
// Gemini 無法直接吃 .docx 二進位,故先轉純文字。僅供 server 端使用。

import mammoth from "mammoth";

export interface DocxResult {
  text: string;
  hadImages: boolean;
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
