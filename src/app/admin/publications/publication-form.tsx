"use client";

import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";

export interface PublicationInitial {
  id: string;
  authors: string;
  title: string;
  venue: string;
  year: number;
  doiUrl: string | null;
  highlight: boolean;
}

export function PublicationForm({
  action,
  initial,
  canPublish,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: PublicationInitial;
  canPublish: boolean;
}) {
  return (
    <ContentFormShell action={action} id={initial?.id} canPublish={canPublish}>
      <Labeled label="作者" htmlFor="authors">
        <input
          id="authors"
          name="authors"
          required
          placeholder="Wu M.-J., et al."
          defaultValue={initial?.authors}
          className={fieldCls}
        />
      </Labeled>
      <Labeled label="論文標題" htmlFor="title">
        <input id="title" name="title" required defaultValue={initial?.title} className={fieldCls} />
      </Labeled>
      <Labeled label="期刊名稱" htmlFor="venue">
        <input id="venue" name="venue" required defaultValue={initial?.venue} className={fieldCls} />
      </Labeled>
      <Labeled label="發表年份" htmlFor="year">
        <input
          id="year"
          name="year"
          type="number"
          required
          defaultValue={initial?.year}
          className={fieldCls}
        />
      </Labeled>
      <Labeled label="DOI 連結(選填)" htmlFor="doiUrl">
        <input id="doiUrl" name="doiUrl" defaultValue={initial?.doiUrl ?? ""} className={fieldCls} />
      </Labeled>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="highlight" defaultChecked={initial?.highlight} />
        精選(前台加粗放大)
      </label>
    </ContentFormShell>
  );
}
