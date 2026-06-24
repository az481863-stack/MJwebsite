"use server";

// Science Blog(G-6)建立/編輯。中英雙版 + Tiptap 內文。
// 學生可建草稿(不可發布);管理員可發布。學生僅能編輯自己且為草稿者。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export interface ActionResult {
  ok: boolean;
  message: string;
}

function parseBody(raw: string): object {
  if (!raw) return { type: "doc", content: [] };
  try {
    return JSON.parse(raw);
  } catch {
    return { type: "doc", content: [] };
  }
}

function parse(formData: FormData) {
  return {
    titleZh: String(formData.get("titleZh") ?? "").trim(),
    titleEn: String(formData.get("titleEn") ?? "").trim(),
    summary: String(formData.get("summary") ?? "").trim() || null,
    bodyZh: parseBody(String(formData.get("bodyZh") ?? "")),
    bodyEn: parseBody(String(formData.get("bodyEn") ?? "")),
    coverUrl: String(formData.get("coverUrl") ?? "").trim() || null,
    dateStr: String(formData.get("publishedDate") ?? ""),
  };
}

export async function createBlogPost(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };
  const f = parse(formData);
  if (!f.titleZh || !f.titleEn || !f.dateStr)
    return { ok: false, message: "請填寫中英標題與發布日期。" };

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  await prisma.blogPost.create({
    data: {
      titleZh: f.titleZh,
      titleEn: f.titleEn,
      summary: f.summary,
      bodyZh: f.bodyZh,
      bodyEn: f.bodyEn,
      coverUrl: f.coverUrl,
      publishedDate: new Date(f.dateStr),
      status: isAdmin && formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/", "layout");
  redirect("/admin/blog");
}

export async function updateBlogPost(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me) return { ok: false, message: "請先登入。" };
  const id = String(formData.get("id") ?? "");
  const existing = await prisma.blogPost.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return { ok: false, message: "找不到該文章。" };

  const isAdmin = roleAtLeast(me.role, "ADMIN");
  if (!isAdmin && (existing.createdBy !== me.id || existing.status !== "DRAFT")) {
    return { ok: false, message: "僅能編輯自己尚未發布的草稿。" };
  }

  const f = parse(formData);
  if (!f.titleZh || !f.titleEn || !f.dateStr)
    return { ok: false, message: "請填寫中英標題與發布日期。" };

  await prisma.blogPost.update({
    where: { id },
    data: {
      titleZh: f.titleZh,
      titleEn: f.titleEn,
      summary: f.summary,
      bodyZh: f.bodyZh,
      bodyEn: f.bodyEn,
      coverUrl: f.coverUrl,
      publishedDate: new Date(f.dateStr),
      updatedBy: me.id,
    },
  });
  revalidatePath("/admin/blog");
  revalidatePath("/", "layout");
  redirect("/admin/blog");
}
