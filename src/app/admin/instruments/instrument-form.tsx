"use client";

// 儀器新增/編輯表單(限 ADMIN)。儀器非草稿/審核內容,故自帶簡易 shell
// (不沿用 ContentFormShell 的發布/草稿訊息)。

import { useActionState } from "react";
import {
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";
import { ImageUpload } from "@/components/admin/ImageUpload";

export interface InstrumentInitial {
  id: string;
  name: string;
  purpose: string;
  photoUrl: string | null;
  status: string;
  sortOrder: number;
  managerEmails: string;
}

export function InstrumentForm({
  action,
  initial,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: InstrumentInitial;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    action,
    null,
  );

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}

      <Labeled label="儀器名稱" htmlFor="name">
        <input id="name" name="name" required defaultValue={initial?.name} className={fieldCls} />
      </Labeled>
      <Labeled label="用途說明" htmlFor="purpose">
        <textarea
          id="purpose"
          name="purpose"
          required
          rows={4}
          defaultValue={initial?.purpose}
          className={fieldCls}
        />
      </Labeled>
      <ImageUpload name="photoUrl" folder="instruments" defaultUrl={initial?.photoUrl} label="儀器照片" />
      <Labeled label="目前狀態" htmlFor="status">
        <select id="status" name="status" defaultValue={initial?.status ?? "NORMAL"} className={fieldCls}>
          <option value="NORMAL">🟢 正常運行</option>
          <option value="MAINTENANCE">🟡 維護中</option>
        </select>
      </Labeled>
      <Labeled label="負責人 email(可多筆,以逗號或換行分隔)" htmlFor="managerEmails">
        <textarea
          id="managerEmails"
          name="managerEmails"
          rows={2}
          placeholder="alice@example.com, bob@example.com"
          defaultValue={initial?.managerEmails}
          className={fieldCls}
        />
      </Labeled>
      <p className="-mt-2 text-xs text-muted">
        負責人須為已存在的會員;找不到的 email 會被忽略。負責人可管理此機台的使用狀況、改機況、代簽,並收異常警報。
      </p>
      <Labeled label="排序(數字越小越前面)" htmlFor="sortOrder">
        <input
          id="sortOrder"
          name="sortOrder"
          type="number"
          defaultValue={initial?.sortOrder ?? 0}
          className={fieldCls}
        />
      </Labeled>

      {state && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}

      <button
        type="submit"
        disabled={pending}
        className="bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "儲存中…" : initial?.id ? "儲存變更" : "建立"}
      </button>
    </form>
  );
}
