"use server";

// Publications(G-2)建立/編輯。學生可建草稿(不可發布);管理員可發布。
// 學生僅能編輯自己且仍為草稿的項目。

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
    highlight: formData.get("highlight") === "on",
  };
}

export async function createPublication(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };
  const f = parse(formData);
  if (!f.authors || !f.title || !f.venue || !f.year)
    return { ok: false, message: "請填寫作者、標題、期刊與年份。" };

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  await prisma.publication.create({
    data: {
      authors: f.authors,
      title: f.title,
      venue: f.venue,
      year: f.year,
      doiUrl: f.doiUrl,
      abstract: f.abstract,
      highlight: f.highlight,
      // 學生一律草稿;管理員可選擇立即發布。
      status: isAdmin && formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
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
  if (!me) return { ok: false, message: "請先登入。" };
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.publication.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return { ok: false, message: "找不到該項目。" };

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  // 學生只能改自己且仍為草稿的項目。
  if (!isAdmin && (existing.createdBy !== me.id || existing.status !== "DRAFT")) {
    return { ok: false, message: "僅能編輯自己尚未發布的草稿。" };
  }

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
      highlight: f.highlight,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/publications");
  revalidatePath("/", "layout");
  redirect("/admin/publications");
}
