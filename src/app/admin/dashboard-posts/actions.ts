"use server";

// 動態佈告欄(G-1)建立/編輯。需 ADMIN 以上。

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DashboardCategory } from "@/generated/prisma/client";

export interface ActionResult {
  ok: boolean;
  message: string;
}

const CATEGORIES = ["ACADEMIC", "LAB_LIFE", "HONOR"];

function parse(formData: FormData) {
  const category = String(formData.get("category") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  const titleEn = String(formData.get("titleEn") ?? "").trim() || null;
  const body = String(formData.get("body") ?? "").trim();
  const bodyEn = String(formData.get("bodyEn") ?? "").trim() || null;
  const imageUrl = String(formData.get("imageUrl") ?? "").trim() || null;
  const linkUrl = String(formData.get("linkUrl") ?? "").trim() || null;
  const linkText = String(formData.get("linkText") ?? "").trim() || null;
  const linkTextEn = String(formData.get("linkTextEn") ?? "").trim() || null;
  const dateStr = String(formData.get("publishedDate") ?? "");
  const expiresStr = String(formData.get("expiresAt") ?? "").trim();
  return { category, title, titleEn, body, bodyEn, imageUrl, linkUrl, linkText, linkTextEn, dateStr, expiresStr };
}

// 過期日:表單有填用之;否則預設發布日 +7 天。
function computeExpiry(dateStr: string, expiresStr: string): Date | null {
  if (expiresStr) return new Date(expiresStr);
  if (!dateStr) return null;
  return new Date(new Date(dateStr).getTime() + 7 * 24 * 60 * 60 * 1000);
}

export async function createDashboardPost(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }
  const f = parse(formData);
  if (!CATEGORIES.includes(f.category) || !f.title || !f.body || !f.dateStr) {
    return { ok: false, message: "請填寫分類、標題、內文與發布日期。" };
  }

  await prisma.dashboardPost.create({
    data: {
      category: f.category as DashboardCategory,
      title: f.title,
      titleEn: f.titleEn,
      body: f.body,
      bodyEn: f.bodyEn,
      imageUrl: f.imageUrl,
      linkUrl: f.linkUrl,
      linkText: f.linkText,
      linkTextEn: f.linkTextEn,
      publishedDate: new Date(f.dateStr),
      expiresAt: computeExpiry(f.dateStr, f.expiresStr),
      status: formData.get("publish") === "on" ? "PUBLISHED" : "DRAFT",
      createdBy: me.id,
      updatedBy: me.id,
    },
  });

  revalidatePath("/admin/dashboard-posts");
  revalidatePath("/", "layout");
  redirect("/admin/dashboard-posts");
}

export async function updateDashboardPost(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }
  const id = String(formData.get("id") ?? "");
  const f = parse(formData);
  if (!id || !CATEGORIES.includes(f.category) || !f.title || !f.body || !f.dateStr) {
    return { ok: false, message: "請填寫分類、標題、內文與發布日期。" };
  }

  await prisma.dashboardPost.update({
    where: { id },
    data: {
      category: f.category as DashboardCategory,
      title: f.title,
      titleEn: f.titleEn,
      body: f.body,
      bodyEn: f.bodyEn,
      imageUrl: f.imageUrl,
      linkUrl: f.linkUrl,
      linkText: f.linkText,
      linkTextEn: f.linkTextEn,
      publishedDate: new Date(f.dateStr),
      expiresAt: computeExpiry(f.dateStr, f.expiresStr),
      updatedBy: me.id,
    },
  });

  revalidatePath("/admin/dashboard-posts");
  revalidatePath("/", "layout");
  redirect("/admin/dashboard-posts");
}
