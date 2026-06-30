"use client";

import { ImageUpload } from "@/components/admin/ImageUpload";
import { TiptapEditor } from "@/components/admin/TiptapEditor";
import {
  ContentFormShell,
  Labeled,
  fieldCls,
  type ActionResult,
} from "@/components/admin/form-kit";
import { BlogTranslateButton } from "./blog-translate-button";

export interface BlogInitial {
  id: string;
  titleZh: string;
  titleEn: string;
  summary: string | null;
  summaryEn: string | null;
  bodyZh: unknown;
  bodyEn: unknown;
  coverUrl: string | null;
  publishedDate: string; // YYYY-MM-DD
}

export function BlogForm({
  action,
  initial,
  canPublish,
}: {
  action: (p: ActionResult | null, fd: FormData) => Promise<ActionResult>;
  initial?: BlogInitial;
  canPublish: boolean;
}) {
  return (
    <ContentFormShell action={action} id={initial?.id} canPublish={canPublish}>
      {initial?.id && (
        <div className="flex flex-wrap items-center justify-between gap-3 border border-line bg-foreground/[0.02] p-3">
          <p className="text-xs text-muted">
            英文(標題/摘要/內文)可一鍵翻譯;會以目前<strong>已儲存</strong>的中文版為準,翻好後請檢查再儲存。
          </p>
          <BlogTranslateButton id={initial.id} />
        </div>
      )}
      <Labeled label="標題(中文)" htmlFor="titleZh">
        <input id="titleZh" name="titleZh" required defaultValue={initial?.titleZh} className={fieldCls} />
      </Labeled>
      <Labeled label="標題(英文)" htmlFor="titleEn">
        <input id="titleEn" name="titleEn" required defaultValue={initial?.titleEn} className={fieldCls} />
      </Labeled>
      <Labeled label="摘要(中文,選填)" htmlFor="summary">
        <textarea
          id="summary"
          name="summary"
          rows={2}
          defaultValue={initial?.summary ?? ""}
          className={fieldCls}
        />
      </Labeled>
      <Labeled label="摘要(英文,選填)" htmlFor="summaryEn">
        <textarea
          id="summaryEn"
          name="summaryEn"
          rows={2}
          defaultValue={initial?.summaryEn ?? ""}
          className={fieldCls}
        />
      </Labeled>
      <Labeled label="發布日期" htmlFor="publishedDate">
        <input
          id="publishedDate"
          name="publishedDate"
          type="date"
          required
          defaultValue={initial?.publishedDate}
          className={fieldCls}
        />
      </Labeled>
      <ImageUpload name="coverUrl" folder="blog" defaultUrl={initial?.coverUrl} label="封面圖" />

      <TiptapEditor name="bodyZh" initial={initial?.bodyZh} label="內文(中文)" />
      <TiptapEditor name="bodyEn" initial={initial?.bodyEn} label="內文(英文)" />
    </ContentFormShell>
  );
}
