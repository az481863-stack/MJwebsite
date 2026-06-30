"use server";

// 階段六:Blog「AI 快速新增」。上傳 Word → Gemini 重寫整理 + 中英兩版 →
// 建立一筆 DRAFT → 導到既有編輯頁讓人審核/修改/發布。AI 一律不自動發布。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { generateHTML } from "@tiptap/html/server";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  isAiEnabled,
  rewriteBlog,
  callGeminiText,
  translateFieldsToEnglish,
} from "@/lib/ai/gemini";
import { extractDocxText } from "@/lib/ai/docx";
import { htmlToTiptapDoc } from "@/lib/ai/tiptap";
import { tiptapExtensions } from "@/lib/tiptap/extensions";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export async function quickAddBlogFromWord(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };
  if (!isAiEnabled()) return { ok: false, message: "AI 功能未啟用。" };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0)
    return { ok: false, message: "請選擇一個 Word(.docx)檔。" };
  if (!file.name.toLowerCase().endsWith(".docx"))
    return { ok: false, message: "僅支援 .docx 檔。" };

  let newId: string;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const { text, hadImages } = await extractDocxText(buffer);
    const ai = await rewriteBlog(text);

    const created = await prisma.blogPost.create({
      data: {
        titleZh: ai.titleZh || "(未命名)",
        titleEn: ai.titleEn || "(Untitled)",
        summary: ai.summary || null,
        bodyZh: htmlToTiptapDoc(ai.bodyHtmlZh, hadImages),
        bodyEn: htmlToTiptapDoc(ai.bodyHtmlEn, hadImages),
        publishedDate: new Date(),
        status: "DRAFT",
        createdBy: me.id,
        updatedBy: me.id,
      },
    });
    newId = created.id;
  } catch (e) {
    return {
      ok: false,
      message: `AI 解析失敗:${e instanceof Error ? e.message : "未知錯誤"}`,
    };
  }

  revalidatePath("/admin/blog");
  redirect(`/admin/blog/${newId}`);
}

// 3.2:把現有文章的中文(標題/摘要/內文)翻成英文,寫回 DB 的英文欄。
// 為避免操作「活的」Tiptap 編輯器,改為寫庫後由前端 reload 帶出英文版。
// 需先儲存草稿(有 id、bodyZh 已存)。權限:管理員或本人草稿。
export async function translateBlog(id: string): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };
  if (!isAiEnabled()) return { ok: false, message: "AI 未啟用。" };

  const post = await prisma.blogPost.findFirst({ where: { id, deletedAt: null } });
  if (!post) return { ok: false, message: "找不到該文章。" };

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  if (!isAdmin && (post.createdBy !== me.id || post.status !== "DRAFT"))
    return { ok: false, message: "僅能翻譯自己尚未發布的草稿。" };

  try {
    const fields = await translateFieldsToEnglish({
      title: post.titleZh,
      summary: post.summary ?? "",
    });

    // 內文:bodyZh JSON → HTML →(翻譯保留標籤)→ Tiptap JSON。
    let bodyEnDoc: object | undefined;
    let zhHtml = "";
    try {
      zhHtml = generateHTML(
        post.bodyZh as Parameters<typeof generateHTML>[0],
        tiptapExtensions,
      );
    } catch {
      zhHtml = "";
    }
    if (zhHtml.replace(/<[^>]*>/g, "").trim()) {
      const enHtml = await callGeminiText(
        "你是專業的繁體中文→英文翻譯。將輸入的 HTML 內文翻成自然、專業的英文," +
          "完整保留原本的 HTML 標籤與結構(<p>、<h2>、<h3>、<strong>、<em>、<ul>、<ol>、<li> 等)," +
          "只翻譯標籤之間的文字,不要新增說明、不要包 <html>/<body>。",
        zhHtml,
      );
      bodyEnDoc = htmlToTiptapDoc(enHtml);
    }

    await prisma.blogPost.update({
      where: { id },
      data: {
        titleEn: fields.title ?? post.titleEn,
        summaryEn: fields.summary ?? post.summaryEn,
        ...(bodyEnDoc ? { bodyEn: bodyEnDoc } : {}),
        updatedBy: me.id,
      },
    });
    revalidatePath(`/admin/blog/${id}`);
    revalidatePath("/admin/blog");
    revalidatePath("/", "layout");
    return { ok: true, message: "已翻譯英文版,請檢查後儲存。" };
  } catch {
    return { ok: false, message: "翻譯失敗,請稍後再試。" };
  }
}
