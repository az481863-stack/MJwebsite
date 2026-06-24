// 全站設定讀取(單列 SiteSettings)。
// 容錯:讀取失敗或尚無資料時回傳預設值,避免 build/執行期因 DB 問題崩潰。

import { prisma } from "@/lib/prisma";

export interface SiteSettingsData {
  showResearch: boolean;
  showTeam: boolean;
  showInstruments: boolean;
  showBlog: boolean;
  showContact: boolean;
  showIndustry: boolean;
  showHighschool: boolean;
  instrumentMaxHours: number;
}

export const DEFAULT_SETTINGS: SiteSettingsData = {
  showResearch: true,
  showTeam: true,
  showInstruments: false,
  showBlog: true,
  showContact: true,
  showIndustry: true,
  showHighschool: true,
  instrumentMaxHours: 24,
};

export async function getSettings(): Promise<SiteSettingsData> {
  try {
    const s = await prisma.siteSettings.findUnique({
      where: { id: "singleton" },
    });
    if (!s) return DEFAULT_SETTINGS;
    return {
      showResearch: s.showResearch,
      showTeam: s.showTeam,
      showInstruments: s.showInstruments,
      showBlog: s.showBlog,
      showContact: s.showContact,
      showIndustry: s.showIndustry,
      showHighschool: s.showHighschool,
      instrumentMaxHours: s.instrumentMaxHours,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
