"use server";

// 共用「一鍵翻譯」server action:把後台表單的中文欄位翻成英文回傳。
// 僅供已登入會員(STUDENT 以上)使用;未設 GEMINI_API_KEY 時回錯誤,手填流程不受影響。

import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { isAiEnabled, translateFieldsToEnglish } from "@/lib/ai/gemini";

export interface TranslateResult {
  ok: boolean;
  data?: Record<string, string>;
  message?: string;
}

export async function translateFieldsAction(
  fields: Record<string, string>,
): Promise<TranslateResult> {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "STUDENT"))
    return { ok: false, message: "權限不足。" };
  if (!isAiEnabled())
    return { ok: false, message: "AI 未啟用(未設定 GEMINI_API_KEY)。" };
  try {
    const data = await translateFieldsToEnglish(fields);
    return { ok: true, data };
  } catch {
    return { ok: false, message: "翻譯失敗,請稍後再試或手動填寫。" };
  }
}
