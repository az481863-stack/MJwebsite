"use client";

import { useActionState } from "react";
import { saveHighSchoolMessage, type ActionResult } from "./actions";

export function HighSchoolForm({
  initialContent,
  initialPublished,
}: {
  initialContent: string;
  initialPublished: boolean;
}) {
  const [state, formAction, pending] = useActionState<
    ActionResult | null,
    FormData
  >(saveHighSchoolMessage, null);

  return (
    <form action={formAction} className="max-w-2xl space-y-5">
      <div>
        <label className="block text-sm font-medium" htmlFor="content">
          引導文章內容
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={14}
          defaultValue={initialContent}
          className="mt-1.5 w-full border border-line px-3 py-2.5 text-sm leading-relaxed outline-none focus:border-line-strong"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="publish" defaultChecked={initialPublished} />
        發布到前台(取消勾選則存為草稿、前台不顯示)
      </label>

      {state && (
        <p className={`text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="bg-foreground px-6 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-85 disabled:opacity-50"
      >
        {pending ? "儲存中…" : "儲存"}
      </button>
    </form>
  );
}
