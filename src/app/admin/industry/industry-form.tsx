"use client";

import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";

export interface IndustryInitial {
  id: string;
  category: string;
  title: string;
  description: string;
  sortOrder: number;
}

export function IndustryForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: IndustryInitial;
}) {
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
      <Labeled label="排序(數字越小越前面)" htmlFor="sortOrder">
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={initial?.sortOrder ?? 0}
          className={fieldCls}
        />
      </Labeled>
    </ContentFormShell>
  );
}
