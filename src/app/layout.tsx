import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { ScrollHideProvider } from "@/lib/scroll-hide";
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-Hant"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <LanguageProvider>
          <ScrollHideProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </ScrollHideProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
