"use server";

// 階段六:Blog「AI 快速新增」。上傳 Word → Gemini 重寫整理 + 中英兩版 →
// 建立一筆 DRAFT → 導到既有編輯頁讓人審核/修改/發布。AI 一律不自動發布。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiEnabled, rewriteBlog } from "@/lib/ai/gemini";
import { extractDocxText } from "@/lib/ai/docx";
import { htmlToTiptapDoc } from "@/lib/ai/tiptap";

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
