"use client";

import { useState } from "react";
import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";
import { TranslateButton } from "@/components/admin/TranslateButton";

export interface CourseInitial {
  id: string;
  name: string;
  nameEn: string | null;
  outline: string;
  outlineEn: string | null;
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
  const [nameEn, setNameEn] = useState(initial?.nameEn ?? "");
  const [outlineEn, setOutlineEn] = useState(initial?.outlineEn ?? "");

  function collect() {
    const get = (id: string) =>
      (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)
        ?.value ?? "";
    return { name: get("name"), outline: get("outline") };
  }
  function apply(out: Record<string, string>) {
    if (out.name != null) setNameEn(out.name);
    if (out.outline != null) setOutlineEn(out.outline);
  }

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

      <div className="border-y border-line py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">英文版(切換 EN 時顯示;留空則沿用中文)</p>
          <TranslateButton collect={collect} apply={apply} />
        </div>
        <div className="mt-3 space-y-3">
          <Labeled label="Name (English)" htmlFor="nameEn">
            <input
              id="nameEn"
              name="nameEn"
              value={nameEn}
              onChange={(e) => setNameEn(e.target.value)}
              className={fieldCls}
            />
          </Labeled>
          <Labeled label="Outline (English)" htmlFor="outlineEn">
            <textarea
              id="outlineEn"
              name="outlineEn"
              rows={4}
              value={outlineEn}
              onChange={(e) => setOutlineEn(e.target.value)}
              className={fieldCls}
            />
          </Labeled>
        </div>
      </div>

      <p className="text-xs text-muted">顯示順序請於列表頁拖曳調整。</p>
    </ContentFormShell>
  );
}
