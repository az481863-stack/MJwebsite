// 後台內容列表共用外殼(server component):標題 + 新增鈕 + 列表 + 已刪除區。
// 各類型只需提供 items/deleted 與每列主要內容的渲染函式。

import Link from "next/link";
import { ContentRowActions, StatusBadge } from "./content-row-actions";

interface BaseItem {
  id: string;
  status: "DRAFT" | "PUBLISHED";
}

export function AdminListShell<T extends BaseItem>({
  title,
  basePath,
  model,
  items,
  deleted,
  renderRow,
  renderDeleted,
  newLabel = "新增",
  canManage = true,
}: {
  title: string;
  basePath: string; // 例:/admin/team
  model: string; // prisma delegate 名,例:teamMember
  items: T[];
  deleted: T[];
  renderRow: (item: T) => React.ReactNode;
  renderDeleted: (item: T) => React.ReactNode;
  newLabel?: string;
  canManage?: boolean; // false:學生視角(僅編輯自己草稿、無發布/刪除/已刪除區)
}) {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <Link
          href={`${basePath}/new`}
          className="bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-85"
        >
          {newLabel}
        </Link>
      </header>

      {items.length === 0 ? (
        <p className="text-sm text-muted">尚無內容。</p>
      ) : (
        <ul className="divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="flex items-start justify-between gap-4 py-4">
              <div className="min-w-0">
                <StatusBadge status={item.status} />
                <div className="mt-1">{renderRow(item)}</div>
              </div>
              <ContentRowActions
                model={model}
                id={item.id}
                status={item.status}
                deleted={false}
                editPath={`${basePath}/${item.id}`}
                listPath={basePath}
                canManage={canManage}
              />
            </li>
          ))}
        </ul>
      )}

      {canManage && deleted.length > 0 && (
        <details className="border-t border-line pt-4">
          <summary className="cursor-pointer text-sm text-muted">
            已刪除({deleted.length})
          </summary>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {deleted.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0 truncate text-sm text-muted line-through">
                  {renderDeleted(item)}
                </span>
                <ContentRowActions
                  model={model}
                  id={item.id}
                  status={item.status}
                  deleted
                  editPath=""
                  listPath={basePath}
                />
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
