"use server";

// 階段七:聊天機器人知識庫的後台 server actions(ADMIN 以上)。
// - regenerateKnowledge:彙整全站內容 → Gemini 濃縮 → 回傳中文(整份覆蓋編輯欄位,尚未存檔)。
// - translateToEnglish:取目前中文編輯內容 → Gemini 翻譯 → 回傳英文(尚未存檔)。
// - saveKnowledge:把編輯欄位內容寫入 SiteSettings(按「儲存」才真正生效於線上聊天)。
// 「更新」「翻譯」皆為整份覆蓋,且回傳結果僅供前端填入欄位,未存檔不影響線上聊天。

import { revalidatePath } from "next/cache";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAiEnabled } from "@/lib/ai/gemini";
import { condenseKnowledge, translateKnowledge, combineKnowledgeZh } from "@/lib/ai/knowledge";

export interface TextResult {
  ok: boolean;
  message: string;
  text?: string;
}

async function requireAdmin(): Promise<boolean> {
  const me = await getCurrentMember();
  return !!me && roleAtLeast(me.role, "ADMIN");
}

export async function regenerateKnowledge(): Promise<TextResult> {
  if (!(await requireAdmin())) return { ok: false, message: "權限不足。" };
  if (!isAiEnabled()) return { ok: false, message: "AI 未啟用(未設定 GEMINI_API_KEY)。" };
  try {
    const text = await condenseKnowledge();
    return { ok: true, message: "已彙整全站內容並產生中文知識庫,請檢視後按「儲存」。", text };
  } catch {
    return { ok: false, message: "產生失敗,請稍後再試。手動編輯與既有知識庫不受影響。" };
  }
}

// 翻譯:把「自動彙整 + 手動補充」合併後的中文譯成英文(英文維持單欄)。
export async function translateToEnglish(
  zhText: string,
  supplementZh: string,
): Promise<TextResult> {
  if (!(await requireAdmin())) return { ok: false, message: "權限不足。" };
  if (!isAiEnabled()) return { ok: false, message: "AI 未啟用(未設定 GEMINI_API_KEY)。" };
  const combined = combineKnowledgeZh(zhText, supplementZh);
  if (!combined.trim()) return { ok: false, message: "中文知識庫為空,無法翻譯。" };
  try {
    const text = await translateKnowledge(combined);
    return { ok: true, message: "已翻譯為英文,請檢視後按「儲存」。", text };
  } catch {
    return { ok: false, message: "翻譯失敗,請稍後再試。" };
  }
}

export async function saveKnowledge(
  zhText: string,
  supplementZh: string,
  enText: string,
): Promise<TextResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) return { ok: false, message: "權限不足。" };
  const data = {
    chatbotKnowledgeZh: zhText,
    chatbotSupplementZh: supplementZh,
    chatbotKnowledgeEn: enText,
    updatedBy: me.id,
  };
  await prisma.siteSettings.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  revalidatePath("/", "layout");
  return { ok: true, message: "知識庫已儲存,線上聊天即採用新內容。" };
}
