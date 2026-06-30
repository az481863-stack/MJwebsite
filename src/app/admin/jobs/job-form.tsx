"use client";

import { useState } from "react";
import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";
import { TranslateButton } from "@/components/admin/TranslateButton";

export interface JobInitial {
  id: string;
  title: string;
  titleEn: string | null;
  recruitStatus: string;
  slots: number | null;
  description: string;
  descriptionEn: string | null;
  sortOrder: number;
}

export function JobForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: JobInitial;
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
      <Labeled label="職位名稱" htmlFor="title">
        <input id="title" name="title" required defaultValue={initial?.title} className={fieldCls} />
      </Labeled>
      <Labeled label="招募狀態" htmlFor="recruitStatus">
        <select
          id="recruitStatus"
          name="recruitStatus"
          defaultValue={initial?.recruitStatus ?? "OPEN"}
          className={fieldCls}
        >
          <option value="OPEN">開放</option>
          <option value="FULL">額滿</option>
        </select>
      </Labeled>
      <Labeled label="名額(選填)" htmlFor="slots">
        <input
          id="slots"
          name="slots"
          type="number"
          defaultValue={initial?.slots ?? ""}
          className={fieldCls}
        />
      </Labeled>
      <Labeled label="職位說明" htmlFor="description">
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

      <Labeled label="層級排序(數字越小越前面)" htmlFor="sortOrder">
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
