// 全站設定讀取(單列 SiteSettings)。
// 容錯:讀取失敗或尚無資料時回傳預設值,避免 build/執行期因 DB 問題崩潰。

import { prisma } from "@/lib/prisma";
import { DEFAULT_ACCENT } from "@/lib/accent";

export interface SiteSettingsData {
  showResearch: boolean;
  showTeam: boolean;
  showInstruments: boolean;
  showBlog: boolean;
  showContact: boolean;
  showIndustry: boolean;
  showHighschool: boolean;
  instrumentMaxHours: number;
  siteAccent: string;
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
  siteAccent: DEFAULT_ACCENT,
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
      siteAccent: s.siteAccent,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
