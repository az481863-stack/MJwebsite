"use client";

import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";

export interface JobInitial {
  id: string;
  title: string;
  recruitStatus: string;
  slots: number | null;
  description: string;
  sortOrder: number;
}

export function JobForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: JobInitial;
}) {
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
