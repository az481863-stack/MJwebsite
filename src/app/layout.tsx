import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { ScrollHideProvider } from "@/lib/scroll-hide";
import { headers } from "next/headers";
import { getSettings } from "@/lib/settings";
import { accentHex } from "@/lib/accent";
import { isAiEnabled } from "@/lib/ai/gemini";
import { isIpBlocked } from "@/lib/chatlog";
import { isRateLimited, chatRateWindows } from "@/lib/ratelimit";
import { hashIp } from "@/lib/iphash";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RouteMask } from "@/components/RouteMask";
import { ChatWidget } from "@/components/ChatWidget";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "光電物理實驗室 | Optoelectronic Physics Lab",
  description:
    "以光為尺,丈量物質的邊界。結合凝態物理、光譜學與奈米製程,探索光與物質交互作用並轉化為次世代光電元件。",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getSettings();
  const navVisible = {
    research: settings.showResearch,
    team: settings.showTeam,
    instruments: settings.showInstruments,
    blog: settings.showBlog,
    contact: settings.showContact,
  };

  // Dark Optics 重點色:由後台 Settings 決定,server-side 注入 CSS 變數(無閃爍)。
  const accent = accentHex(settings.siteAccent);

  // 階段七:聊天入口僅在「後台開關開啟」且「已設 GEMINI_API_KEY」時掛載;
  // 另若訪客 IP 被後台封鎖、或已達速率上限,亦不掛(見 /admin/chat-logs 的 switch)。
  const baseChatbotEnabled = settings.showChatbot && isAiEnabled();
  const visitorHash = baseChatbotEnabled
    ? hashIp((await headers()).get("x-forwarded-for"))
    : "unknown";
  const chatbotEnabled =
    baseChatbotEnabled &&
    !(await isIpBlocked(visitorHash)) &&
    !(await isRateLimited("chat", visitorHash, chatRateWindows(settings)));

  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <ScrollHideProvider>
            <RouteMask />
            <Navbar visible={navVisible} />
            <main className="flex-1">{children}</main>
            <Footer
              visible={navVisible}
              showHighschool={settings.showHighschool}
            />
            {chatbotEnabled && <ChatWidget />}
          </ScrollHideProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
