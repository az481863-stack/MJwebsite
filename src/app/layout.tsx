import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { ScrollHideProvider } from "@/lib/scroll-hide";
import { getSettings } from "@/lib/settings";
import { accentHex } from "@/lib/accent";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

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

  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={{ "--accent": accent } as React.CSSProperties}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <ScrollHideProvider>
            <Navbar visible={navVisible} />
            <main className="flex-1">{children}</main>
            <Footer
              visible={navVisible}
              showHighschool={settings.showHighschool}
            />
          </ScrollHideProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
