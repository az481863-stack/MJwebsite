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
  adminGuide: string;
  homeHeroTitleZh: string;
  homeHeroTitleEn: string;
  homeHeroSubtitleZh: string;
  homeHeroSubtitleEn: string;
  homePhilosophyBodyZh: string;
  homePhilosophyBodyEn: string;
  homeResearchHeadingZh: string;
  homeResearchHeadingEn: string;
  homeResearchIntroZh: string;
  homeResearchIntroEn: string;
  homeResearchAreasZh: string;
  homeResearchAreasEn: string;
  contactLabNameZh: string;
  contactLabNameEn: string;
  contactAddressZh: string;
  contactAddressEn: string;
  contactEmail: string;
  contactPhone: string;
  contactOfficeHoursZh: string;
  contactOfficeHoursEn: string;
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
  adminGuide: "",
  homeHeroTitleZh: "",
  homeHeroTitleEn: "",
  homeHeroSubtitleZh: "",
  homeHeroSubtitleEn: "",
  homePhilosophyBodyZh: "",
  homePhilosophyBodyEn: "",
  homeResearchHeadingZh: "",
  homeResearchHeadingEn: "",
  homeResearchIntroZh: "",
  homeResearchIntroEn: "",
  homeResearchAreasZh: "",
  homeResearchAreasEn: "",
  contactLabNameZh: "",
  contactLabNameEn: "",
  contactAddressZh: "",
  contactAddressEn: "",
  contactEmail: "",
  contactPhone: "",
  contactOfficeHoursZh: "",
  contactOfficeHoursEn: "",
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
      adminGuide: s.adminGuide,
      homeHeroTitleZh: s.homeHeroTitleZh,
      homeHeroTitleEn: s.homeHeroTitleEn,
      homeHeroSubtitleZh: s.homeHeroSubtitleZh,
      homeHeroSubtitleEn: s.homeHeroSubtitleEn,
      homePhilosophyBodyZh: s.homePhilosophyBodyZh,
      homePhilosophyBodyEn: s.homePhilosophyBodyEn,
      homeResearchHeadingZh: s.homeResearchHeadingZh,
      homeResearchHeadingEn: s.homeResearchHeadingEn,
      homeResearchIntroZh: s.homeResearchIntroZh,
      homeResearchIntroEn: s.homeResearchIntroEn,
      homeResearchAreasZh: s.homeResearchAreasZh,
      homeResearchAreasEn: s.homeResearchAreasEn,
      contactLabNameZh: s.contactLabNameZh,
      contactLabNameEn: s.contactLabNameEn,
      contactAddressZh: s.contactAddressZh,
      contactAddressEn: s.contactAddressEn,
      contactEmail: s.contactEmail,
      contactPhone: s.contactPhone,
      contactOfficeHoursZh: s.contactOfficeHoursZh,
      contactOfficeHoursEn: s.contactOfficeHoursEn,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}
