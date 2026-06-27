// 把 AI 產出的簡單 HTML 轉成合法的 Tiptap doc JSON(與手填編輯器同格式)。
// 用 @tiptap/html/server 的 generateJSON;只保留 tiptapExtensions 認得的節點 = 天然 sanitize。

import { generateJSON } from "@tiptap/html/server";
import { tiptapExtensions } from "@/lib/tiptap/extensions";

const IMAGE_PLACEHOLDER = "【原文含圖片,AI 無法搬運,請於編輯器自行補上對應圖片】";

export function htmlToTiptapDoc(html: string, hadImages = false): object {
  const doc = generateJSON(html ?? "", tiptapExtensions) as {
    type: string;
    content?: unknown[];
  };
  const content = Array.isArray(doc.content) ? doc.content : [];

  if (hadImages) {
    content.unshift({
      type: "paragraph",
      content: [{ type: "text", text: IMAGE_PLACEHOLDER }],
    });
  }

  return { type: "doc", content };
}
