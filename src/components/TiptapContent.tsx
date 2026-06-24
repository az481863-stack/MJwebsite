// 前台渲染 Tiptap JSON 為 HTML(server-side,利於 SEO)。
// 套用 .rich-text 樣式(見 globals.css)。

import { generateHTML } from "@tiptap/html/server";
import { tiptapExtensions } from "@/lib/tiptap/extensions";

export function TiptapContent({
  json,
  className = "",
}: {
  json: unknown;
  className?: string;
}) {
  if (!json || typeof json !== "object") return null;
  let html = "";
  try {
    html = generateHTML(json as Parameters<typeof generateHTML>[0], tiptapExtensions);
  } catch {
    return null;
  }
  return (
    <div
      className={`rich-text ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
