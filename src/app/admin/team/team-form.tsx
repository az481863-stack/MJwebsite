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
          <option value="PROFESSOR">教授</option>
          <option value="DISTINGUISHED_PROFESSOR">特聘教授</option>
          <option value="EMERITUS_PROFESSOR">名譽教授</option>
          <option value="ASSOC_PROFESSOR">副教授</option>
          <option value="ASST_PROFESSOR">助理教授</option>
          <option value="VISITING_PROFESSOR">客座教授</option>
          <option value="ADJUNCT_PROFESSOR">兼任教授</option>
          <option value="POSTDOC">博後</option>
          <option value="STAFF">專任助理</option>
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
      <p className="text-xs text-muted">顯示順序請於列表頁拖曳調整。</p>
    </ContentFormShell>
  );
}
