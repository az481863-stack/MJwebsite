"use client";

// 導覽列(A-2):極簡黑字置頂,向下捲動隱藏、向上捲動顯示。
// 右側固定語系切換鈕;手機版收合為漢堡選單。

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
// 手機選單於點擊連結時關閉(避免 setState-in-effect)。
import { NAV_ITEMS } from "@/lib/i18n/dictionary";
import { useLanguage } from "@/lib/i18n/context";
import { useScrollHidden } from "@/lib/scroll-hide";
import { useAuthState } from "@/lib/use-auth-state";
import { Container } from "./ui/Container";
import { LanguageToggle } from "./LanguageToggle";

// 內頁 navbar 雷射光束(viewBox 1200×64,x:0=左 1200=右,y:0=上 64=下)。
// beam1:左邊 → 上面(起點 x=0、終點 y=0)。
// beam2:上面 → 右邊(起點 y=0、終點 x=1200)。
// 自由端隨機,讓每次傾角不同。
const rnd = (min: number, max: number) =>
  Math.round(min + Math.random() * (max - min));
function randomBeam1() {
  return { x1: 0, y1: rnd(16, 60), x2: rnd(150, 760), y2: 0 };
}
function randomBeam2() {
  return { x1: rnd(440, 1050), y1: 0, x2: 1200, y2: rnd(16, 60) };
}

export function Navbar({
  visible = {},
}: {
  visible?: Partial<Record<string, boolean>>;
}) {
  const { t } = useLanguage();
  // 兩條光束端點:初始固定值(避免 SSR/hydration 不一致),之後每射一輪換隨機角度。
  // beam1 左→上、beam2 上→右。
  const [beam1, setBeam1] = useState({ x1: 0, y1: 46, x2: 430, y2: 0 });
  const [beam2, setBeam2] = useState({ x1: 770, y1: 0, x2: 1200, y2: 46 });
  const pathname = usePathname();
  const hidden = useScrollHidden();
  const isAuthed = useAuthState();
  const [menuOpen, setMenuOpen] = useState(false);

  // 依設定隱藏導覽項(首頁恆顯示;未列於 visible 的項目視為顯示)。
  const navItems = NAV_ITEMS.filter((item) => visible[item.key] !== false);

  // 登入後顯示「管理」(/admin)與「會員」(/account);未登入顯示「登入」。
  const authLinks = isAuthed
    ? [
        { href: "/admin", label: t.auth.admin },
        { href: "/account", label: t.auth.account },
      ]
    : [{ href: "/login", label: t.auth.login }];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // 深色 navbar:套用於「非首頁」的前台頁;首頁(疊在深色 Hero 上)與後台維持淺色。
  const isBackOffice = /^\/(admin|login|account|setup|invite|auth)(\/|$)/.test(
    pathname,
  );
  const dark = pathname !== "/" && !isBackOffice;

  return (
    <header
      className={`sticky top-0 z-50 border-b border-line backdrop-blur transition-transform duration-300 ${
        dark ? "band-dark bg-background/95" : "bg-background/90"
      } ${hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"}`}
    >
      {/* 內頁深色 navbar 的雷射光束:兩條,相隔 0.5 秒射入,各自隨機角度 */}
      {dark && (
        <svg
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 z-0 h-16 w-full"
          viewBox="0 0 1200 64"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="nav-beam" x1="0" y1="0" x2="1" y2="0">
              <stop className="beam-stop-0" offset="0%" />
              <stop className="beam-stop-1" offset="55%" />
              <stop className="beam-stop-0" offset="100%" />
            </linearGradient>
          </defs>
          <line
            className="nav-beam-line nav-beam-fast"
            x1={beam1.x1}
            y1={beam1.y1}
            x2={beam1.x2}
            y2={beam1.y2}
            stroke="url(#nav-beam)"
            strokeWidth="1.5"
            // 第一條:左→上、光束飛得快;每輪結束於隱形空檔換隨機角度
            onAnimationIteration={() => setBeam1(randomBeam1())}
          />
          <line
            className="nav-beam-line nav-beam-slow"
            x1={beam2.x1}
            y1={beam2.y1}
            x2={beam2.x2}
            y2={beam2.y2}
            stroke="url(#nav-beam)"
            strokeWidth="1.5"
            // 第二條:上→右、光束飛得慢,延遲 1 秒射入,角度獨立隨機
            style={{ animationDelay: "1s" }}
            onAnimationIteration={() => setBeam2(randomBeam2())}
          />
        </svg>
      )}
      <Container>
        <div className="relative z-10 flex h-16 items-center justify-between">
          {/* 品牌 */}
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight whitespace-nowrap"
          >
            {t.footer.rights}
          </Link>

          {/* 桌機導覽 */}
          <nav className="hidden items-center gap-7 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-foreground ${
                  isActive(item.href)
                    ? (dark ? "font-semibold text-accent" : "font-semibold text-foreground")
                    : "text-muted"
                }`}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          {/* 右側:會員/管理入口 + 語系 + 手機漢堡 */}
          <div className="flex items-center gap-3">
            {authLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`hidden text-sm transition-colors hover:text-foreground md:inline ${
                  isActive(l.href)
                    ? (dark ? "font-semibold text-accent" : "font-semibold text-foreground")
                    : "text-muted"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <LanguageToggle />
            <button
              type="button"
              className="flex h-9 w-9 items-center justify-center md:hidden"
              aria-label="Menu"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <span className="relative block h-4 w-5">
                <span
                  className={`absolute left-0 block h-0.5 w-5 bg-foreground transition-all ${
                    menuOpen ? "top-1.5 rotate-45" : "top-0"
                  }`}
                />
                <span
                  className={`absolute left-0 top-1.5 block h-0.5 w-5 bg-foreground transition-opacity ${
                    menuOpen ? "opacity-0" : "opacity-100"
                  }`}
                />
                <span
                  className={`absolute left-0 block h-0.5 w-5 bg-foreground transition-all ${
                    menuOpen ? "top-1.5 -rotate-45" : "top-3"
                  }`}
                />
              </span>
            </button>
          </div>
        </div>
      </Container>

      {/* 手機選單 */}
      {menuOpen && (
        <nav className="relative z-10 border-t border-line md:hidden">
          <Container>
            <ul className="flex flex-col py-2">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-3 text-base transition-colors ${
                      isActive(item.href)
                        ? (dark ? "font-semibold text-accent" : "font-semibold text-foreground")
                        : "text-muted"
                    }`}
                  >
                    {t.nav[item.key]}
                  </Link>
                </li>
              ))}
              {authLinks.map((l) => (
                <li key={l.href} className="border-t border-line">
                  <Link
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-3 text-base transition-colors ${
                      isActive(l.href)
                        ? (dark ? "font-semibold text-accent" : "font-semibold text-foreground")
                        : "text-muted"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </nav>
      )}
    </header>
  );
}
