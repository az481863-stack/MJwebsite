// 後台「使用說明」頁:供未來接手的管理員閱讀後台操作指引(Markdown,可切換編輯)。
// 另掛載「管理員小幫手」(Emerald 色,與前台實驗室小幫手區隔),依本頁說明內容回答。
// 權限:ADMIN 以上。

import { redirect } from "next/navigation";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { GuideView } from "./guide-view";

export const dynamic = "force-dynamic";

export default async function AdminGuidePage() {
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) redirect("/account");

  const settings = await getSettings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">使用說明</h1>
        <p className="mt-1 text-sm text-muted">
          後台操作指引,供接手的管理員閱讀。可按「編輯」以 Markdown 維護;
          右下角的「管理員小幫手」會依本頁內容回答操作問題。
        </p>
      </div>

      <GuideView initial={settings.adminGuide} canEdit={roleAtLeast(me.role, "ADMIN")} />
    </div>
  );
}
