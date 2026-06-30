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
  showChatbot: boolean;
  chatbotKnowledgeZh: string;
  chatbotKnowledgeEn: string;
  homeHeroTitleZh: string;
  homeHeroTitleEn: string;
  homeHeroSubtitleZh: string;
  homeHeroSubtitleEn: string;
  homePhilosophyBodyZh: string;
  homePhilosophyBodyEn: string;
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
  showChatbot: false,
  chatbotKnowledgeZh: "",
  chatbotKnowledgeEn: "",
  homeHeroTitleZh: "",
  homeHeroTitleEn: "",
  homeHeroSubtitleZh: "",
  homeHeroSubtitleEn: "",
  homePhilosophyBodyZh: "",
  homePhilosophyBodyEn: "",
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
      showChatbot: s.showChatbot,
      chatbotKnowledgeZh: s.chatbotKnowledgeZh,
      chatbotKnowledgeEn: s.chatbotKnowledgeEn,
      homeHeroTitleZh: s.homeHeroTitleZh,
      homeHeroTitleEn: s.homeHeroTitleEn,
      homeHeroSubtitleZh: s.homeHeroSubtitleZh,
      homeHeroSubtitleEn: s.homeHeroSubtitleEn,
      homePhilosophyBodyZh: s.homePhilosophyBodyZh,
      homePhilosophyBodyEn: s.homePhilosophyBodyEn,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
