"use server";

// 網站設定儲存(ADMIN 以上)。upsert 單列 SiteSettings。

import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_ACCENT, isAccentKey } from "@/lib/accent";

export interface ActionResult {
  ok: boolean;
  message: string;
}

export async function saveSettings(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return { ok: false, message: "權限不足。" };
  }

  const bool = (k: string) => formData.get(k) === "on";
  const hours = parseInt(String(formData.get("instrumentMaxHours") ?? "24"), 10);
  const instrumentMaxHours = Number.isFinite(hours) && hours > 0 ? hours : 24;

  const accentRaw = String(formData.get("siteAccent") ?? "");
  const siteAccent = isAccentKey(accentRaw) ? accentRaw : DEFAULT_ACCENT;

  const data = {
    showResearch: bool("showResearch"),
    showTeam: bool("showTeam"),
    showInstruments: bool("showInstruments"),
    showBlog: bool("showBlog"),
    showContact: bool("showContact"),
    showIndustry: bool("showIndustry"),
    showHighschool: bool("showHighschool"),
    showChatbot: bool("showChatbot"),
    instrumentMaxHours,
    siteAccent,
    updatedBy: me.id,
  };

  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });

  // 設定影響導覽與前台,整站重新驗證。
  revalidatePath("/", "layout");
  return { ok: true, message: "設定已儲存。" };
}
