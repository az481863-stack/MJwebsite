"use server";

// Publications(G-2)建立/編輯。僅管理員以上(學生無 Publications 權限)。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionResult {
  ok: boolean;
  message: string;
}

function parse(formData: FormData) {
  return {
    authors: String(formData.get("authors") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    venue: String(formData.get("venue") ?? "").trim(),
    year: parseInt(String(formData.get("year") ?? ""), 10),
    doiUrl: String(formData.get("doiUrl") ?? "").trim() || null,
    abstract: String(formData.get("abstract") ?? "").trim() || null,
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    highlight: formData.get("highlight") === "on",
  };
}

export async function createPublication(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const f = parse(formData);
  if (!f.authors || !f.title || !f.venue || !f.year)
    return { ok: false, message: "請填寫作者、標題、期刊與年份。" };

  await prisma.publication.create({
    data: {
      authors: f.authors,
      title: f.title,
      venue: f.venue,
      year: f.year,
      doiUrl: f.doiUrl,
      abstract: f.abstract,
      imageUrl: f.imageUrl,
      highlight: f.highlight,
      // 管理員可選擇立即發布,否則存為草稿。
      status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/publications");
  revalidatePath("/", "layout");
  redirect("/admin/publications");
}

export async function updatePublication(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN"))
    return { ok: false, message: "權限不足。" };
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.publication.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return { ok: false, message: "找不到該項目。" };

  const f = parse(formData);
  if (!f.authors || !f.title || !f.venue || !f.year)
    return { ok: false, message: "請填寫作者、標題、期刊與年份。" };

  await prisma.publication.update({
    where: { id },
    data: {
      authors: f.authors,
      title: f.title,
      venue: f.venue,
      year: f.year,
      doiUrl: f.doiUrl,
      abstract: f.abstract,
      imageUrl: f.imageUrl,
      highlight: f.highlight,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/publications");
  revalidatePath("/", "layout");
  redirect("/admin/publications");
}
