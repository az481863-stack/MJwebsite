"use client";

import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";

export interface CourseInitial {
  id: string;
  name: string;
  outline: string;
  handoutUrl: string | null;
  sortOrder: number;
}

export function CourseForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: CourseInitial;
}) {
  return (
    <ContentFormShell action={action} id={initial?.id}>
      <Labeled label="課程名稱" htmlFor="name">
        <input id="name" name="name" required defaultValue={initial?.name} className={fieldCls} />
      </Labeled>
      <Labeled label="大綱" htmlFor="outline">
        <textarea
          id="outline"
          name="outline"
          required
          rows={4}
          defaultValue={initial?.outline}
          className={fieldCls}
        />
      </Labeled>
      <Labeled label="講義下載連結(選填)" htmlFor="handoutUrl">
        <input
          id="handoutUrl"
          name="handoutUrl"
          defaultValue={initial?.handoutUrl ?? ""}
          className={fieldCls}
        />
      </Labeled>
      <p className="text-xs text-muted">顯示順序請於列表頁拖曳調整。</p>
    </ContentFormShell>
  );
}
