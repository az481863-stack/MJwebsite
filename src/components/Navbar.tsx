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
import { Container } from "./ui/Container";
import { LanguageToggle } from "./LanguageToggle";

export function Navbar() {
  const { t } = useLanguage();
  const pathname = usePathname();
  const hidden = useScrollHidden();
  const [menuOpen, setMenuOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-line bg-background/90 backdrop-blur transition-transform duration-300 ${
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* 品牌 */}
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight whitespace-nowrap"
          >
            {t.footer.rights}
          </Link>

          {/* 桌機導覽 */}
          <nav className="hidden items-center gap-7 md:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors hover:text-foreground ${
                  isActive(item.href)
                    ? "font-semibold text-foreground"
                    : "text-muted"
                }`}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          {/* 右側:語系 + 手機漢堡 */}
          <div className="flex items-center gap-3">
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
        <nav className="border-t border-line md:hidden">
          <Container>
            <ul className="flex flex-col py-2">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className={`block py-3 text-base transition-colors ${
                      isActive(item.href)
                        ? "font-semibold text-foreground"
                        : "text-muted"
                    }`}
                  >
                    {t.nav[item.key]}
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
