"use client";

import { ImageUpload } from "@/components/admin/ImageUpload";
import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";

export interface TeamInitial {
  id: string;
  name: string;
  tier: string;
  photoUrl: string | null;
  researchTopic: string | null;
  sortOrder: number;
}

export function TeamForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: TeamInitial;
}) {
  return (
    <ContentFormShell action={action} id={initial?.id}>
      <Labeled label="姓名" htmlFor="name">
        <input id="name" name="name" required defaultValue={initial?.name} className={fieldCls} />
      </Labeled>
      <Labeled label="身份階層" htmlFor="tier">
        <select id="tier" name="tier" defaultValue={initial?.tier ?? "PHD"} className={fieldCls}>
          <option value="POSTDOC">博後</option>
          <option value="PHD">博士生</option>
          <option value="MASTER">碩士生</option>
          <option value="UNDERGRAD">專題生</option>
        </select>
      </Labeled>
      <Labeled label="研究題目" htmlFor="researchTopic">
        <input
          id="researchTopic"
          name="researchTopic"
          defaultValue={initial?.researchTopic ?? ""}
          className={fieldCls}
        />
      </Labeled>
      <ImageUpload name="photoUrl" folder="team" defaultUrl={initial?.photoUrl} label="照片" />
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
