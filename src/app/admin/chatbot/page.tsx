import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { isAiEnabled } from "@/lib/ai/gemini";
import { KnowledgeForm } from "./knowledge-form";

export const dynamic = "force-dynamic";

export default async function ChatbotKnowledgePage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">聊天機器人知識庫</h1>
        <p className="mt-1 text-sm text-muted">
          前台聊天機器人依此知識庫回答。中文分兩欄:「自動彙整」由「更新知識庫」重產(會覆蓋),
          「手動補充」是你自己維護的內容(不會被覆蓋);聊天時兩者合併使用。
          維護流程:更新知識庫(產彙整)→ 補充自訂內容 → 翻譯(合併後產英文)→ 微調 → 儲存。前台顯示開關於「網站設定」。
        </p>
      </div>
      <KnowledgeForm
        initialZh={settings.chatbotKnowledgeZh}
        initialSupplement={settings.chatbotSupplementZh}
        initialEn={settings.chatbotKnowledgeEn}
        aiEnabled={isAiEnabled()}
      />
    </div>
  );
}
