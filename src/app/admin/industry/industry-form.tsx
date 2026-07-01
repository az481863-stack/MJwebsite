"use client";

import { useState } from "react";
import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";
import { TranslateButton } from "@/components/admin/TranslateButton";

export interface IndustryInitial {
  id: string;
  category: string;
  title: string;
  titleEn: string | null;
  description: string;
  descriptionEn: string | null;
  sortOrder: number;
}

export function IndustryForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: IndustryInitial;
}) {
  const [titleEn, setTitleEn] = useState(initial?.titleEn ?? "");
  const [descriptionEn, setDescriptionEn] = useState(
    initial?.descriptionEn ?? "",
  );

  function collect() {
    const get = (id: string) =>
      (document.getElementById(id) as HTMLInputElement | HTMLTextAreaElement | null)
        ?.value ?? "";
    return { title: get("title"), description: get("description") };
  }
  function apply(out: Record<string, string>) {
    if (out.title != null) setTitleEn(out.title);
    if (out.description != null) setDescriptionEn(out.description);
  }

  return (
    <ContentFormShell action={action} id={initial?.id}>
      <Labeled label="分類" htmlFor="category">
        <select
          id="category"
          name="category"
          defaultValue={initial?.category ?? "PATENT"}
          className={fieldCls}
        >
          <option value="PATENT">已獲證專利</option>
          <option value="LICENSABLE">可授權技術</option>
          <option value="COLLABORATION">企業合作/技轉實績</option>
        </select>
      </Labeled>
      <Labeled label="標題" htmlFor="title">
        <input id="title" name="title" required defaultValue={initial?.title} className={fieldCls} />
      </Labeled>
      <Labeled label="說明" htmlFor="description">
        <textarea
          id="description"
          name="description"
          required
          rows={4}
          defaultValue={initial?.description}
          className={fieldCls}
        />
      </Labeled>

      <div className="border-y border-line py-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">英文版(切換 EN 時顯示;留空則沿用中文)</p>
          <TranslateButton collect={collect} apply={apply} />
        </div>
        <div className="mt-3 space-y-3">
          <Labeled label="Title (English)" htmlFor="titleEn">
            <input
              id="titleEn"
              name="titleEn"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              className={fieldCls}
            />
          </Labeled>
          <Labeled label="Description (English)" htmlFor="descriptionEn">
            <textarea
              id="descriptionEn"
              name="descriptionEn"
              rows={4}
              value={descriptionEn}
              onChange={(e) => setDescriptionEn(e.target.value)}
              className={fieldCls}
            />
          </Labeled>
        </div>
      </div>

      <p className="text-xs text-muted">
        顯示順序請於列表頁拖曳調整(僅同分類內)。
      </p>
    </ContentFormShell>
  );
}
