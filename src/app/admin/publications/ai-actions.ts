"use server";

// 階段六:Publications「AI 快速新增」。上傳 Word → Gemini 抽取書目欄位(不可改寫)→
// 建立一筆 DRAFT → 導到既有編輯頁讓人核對/修改/發布。AI 一律不自動發布。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiEnabled, extractPublication } from "@/lib/ai/gemini";
import { extractDocxText } from "@/lib/ai/docx";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export async function quickAddPublicationFromWord(
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
    const { text } = await extractDocxText(buffer);
    const ai = await extractPublication(text);

    const created = await prisma.publication.create({
      data: {
        authors: ai.authors || "(待補)",
        title: ai.title || "(待補)",
        venue: ai.venue || "(待補)",
        year: ai.year && ai.year > 0 ? ai.year : new Date().getFullYear(),
        doiUrl: ai.doiUrl || null,
        highlight: false,
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

  revalidatePath("/admin/publications");
  redirect(`/admin/publications/${newId}`);
}
