"use client";

import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";

export interface AlumnusInitial {
  id: string;
  name: string;
  gradYear: number;
  destination: string;
  photoUrl: string | null;
  sortOrder: number;
}

export function AlumnusForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: AlumnusInitial;
}) {
  return (
    <ContentFormShell action={action} id={initial?.id}>
      <Labeled label="姓名" htmlFor="name">
        <input id="name" name="name" required defaultValue={initial?.name} className={fieldCls} />
      </Labeled>
      <Labeled label="畢業年份" htmlFor="gradYear">
        <input
          id="gradYear"
          name="gradYear"
          type="number"
          required
          defaultValue={initial?.gradYear}
          className={fieldCls}
        />
      </Labeled>
      <Labeled label="去向" htmlFor="destination">
        <input
          id="destination"
          name="destination"
          required
          defaultValue={initial?.destination}
          className={fieldCls}
        />
      </Labeled>
      <ImageUpload name="photoUrl" folder="alumni" defaultUrl={initial?.photoUrl} label="照片" />
      <p className="text-xs text-muted">顯示順序請於列表頁拖曳調整。</p>
    </ContentFormShell>
  );
}
