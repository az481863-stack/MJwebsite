"use client";

// 後台側邊導覽:依角色顯示可用項目。
// - 會員管理、設定:ADMIN 以上。
// - 內容類型:依 registry 的 minRole 篩選(學生只看到可投稿的 Blog/Publications)。

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Role } from "@/generated/prisma/client";
import { roleAtLeast } from "@/lib/roles";
import { CMS_TYPES } from "@/lib/cms/registry";

export function AdminSidebar({
  role,
  canManageInstruments = false,
}: {
  role: Role;
  canManageInstruments?: boolean;
}) {
  const pathname = usePathname();
  const isAdmin = roleAtLeast(role, "ADMIN");

  const contentItems = CMS_TYPES.filter((t) => roleAtLeast(role, t.minRole));

  const itemCls = (href: string) =>
    `block rounded-sm px-3 py-2 text-sm transition-colors ${
      pathname === href || pathname.startsWith(href + "/")
        ? "bg-foreground text-background"
        : "text-muted hover:bg-foreground/[0.04] hover:text-foreground"
    }`;

  return (
    <aside className="lg:w-56 lg:shrink-0">
      <nav className="space-y-6">
        <div>
          <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
            內容
          </p>
          <ul className="space-y-0.5">
            {contentItems.map((t) => (
              <li key={t.key}>
                <Link href={t.path} className={itemCls(t.path)}>
                  {t.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {(isAdmin || canManageInstruments) && (
          <div>
            <p className="px-3 pb-1 text-xs font-semibold uppercase tracking-wider text-muted">
              管理
            </p>
            <ul className="space-y-0.5">
              {canManageInstruments && (
                <li>
                  <Link href="/admin/instruments" className={itemCls("/admin/instruments")}>
                    儀器管理
                  </Link>
                </li>
              )}
              {isAdmin && (
                <>
                  <li>
                    <Link href="/admin/members" className={itemCls("/admin/members")}>
                      會員管理
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/chatbot" className={itemCls("/admin/chatbot")}>
                      聊天機器人知識庫
                    </Link>
                  </li>
                  <li>
                    <Link href="/admin/settings" className={itemCls("/admin/settings")}>
                      網站設定
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>
        )}

        <div className="border-t border-line pt-4">
          <Link href="/account" className={itemCls("/account")}>
            ← 回會員頁
          </Link>
        </div>
      </nav>
    </aside>
  );
}
