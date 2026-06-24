"use client";

// 富文本編輯器(Tiptap)。輸出 JSON 至隱藏 input(name)供表單送出。
// 用於 Blog 內文(中/英)。

import { useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import imageCompression from "browser-image-compression";
import { tiptapExtensions } from "@/lib/tiptap/extensions";
import { uploadImage } from "@/app/admin/upload-actions";

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={`min-w-8 border border-line px-2 py-1 text-xs transition-colors ${
        active ? "bg-foreground text-background" : "hover:bg-foreground/[0.05]"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const insertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploading(true);
      try {
        const compressed = await imageCompression(file, {
          maxSizeMB: 0.6,
          maxWidthOrHeight: 1600,
          useWebWorker: true,
        });
        const fd = new FormData();
        fd.append("file", compressed, compressed.name);
        fd.append("folder", "blog");
        const res = await uploadImage(fd);
        if (res.ok && res.url) {
          editor.chain().focus().setImage({ src: res.url }).run();
        }
      } finally {
        setUploading(false);
      }
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="flex flex-wrap gap-1 border-b border-line p-2">
      <ToolbarButton
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        H2
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        H3
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        • 清單
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        1. 清單
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        引言
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <u>U</u>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("code")}
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        {"</>"}
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("highlight")}
        onClick={() => editor.chain().focus().toggleHighlight().run()}
      >
        標記
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("superscript")}
        onClick={() => editor.chain().focus().toggleSuperscript().run()}
      >
        x²
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("subscript")}
        onClick={() => editor.chain().focus().toggleSubscript().run()}
      >
        x₂
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "left" })}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
      >
        ⇤
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "center" })}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
      >
        ⇔
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive({ textAlign: "right" })}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
      >
        ⇥
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        程式碼
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ──
      </ToolbarButton>
      <ToolbarButton
        onClick={() =>
          editor
            .chain()
            .focus()
            .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
            .run()
        }
      >
        表格
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const latex = window.prompt("行內公式 LaTeX(例:E=mc^2)");
          if (latex) editor.chain().focus().insertInlineMath({ latex }).run();
        }}
      >
        ƒ 行內
      </ToolbarButton>
      <ToolbarButton
        onClick={() => {
          const latex = window.prompt("獨立公式 LaTeX(例:\\int_0^1 x\\,dx)");
          if (latex) editor.chain().focus().insertBlockMath({ latex }).run();
        }}
      >
        ƒ 區塊
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("link")}
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("連結網址", prev ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().unsetLink().run();
          } else {
            editor.chain().focus().setLink({ href: url }).run();
          }
        }}
      >
        連結
      </ToolbarButton>
      <ToolbarButton
        onClick={() => fileRef.current?.click()}
      >
        {uploading ? "上傳中…" : "🖼 圖片"}
      </ToolbarButton>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={insertImage}
        className="hidden"
      />
      <ToolbarButton onClick={() => editor.chain().focus().undo().run()}>
        ↶
      </ToolbarButton>
      <ToolbarButton onClick={() => editor.chain().focus().redo().run()}>
        ↷
      </ToolbarButton>
    </div>
  );
}

export function TiptapEditor({
  name,
  initial,
  label,
}: {
  name: string;
  initial?: unknown;
  label?: string;
}) {
  const [json, setJson] = useState<string>(
    initial ? JSON.stringify(initial) : "",
  );

  const editor = useEditor({
    extensions: tiptapExtensions,
    content: (initial as object) ?? "",
    immediatelyRender: false, // Next SSR 必要
    onUpdate: ({ editor }) => setJson(JSON.stringify(editor.getJSON())),
    editorProps: {
      attributes: {
        class: "rich-text min-h-48 px-3 py-3 focus:outline-none",
      },
    },
  });

  return (
    <div>
      {label && <span className="block text-sm font-medium">{label}</span>}
      <div className="mt-1.5 border border-line">
        {editor && <Toolbar editor={editor} />}
        <EditorContent editor={editor} />
      </div>
      <input type="hidden" name={name} value={json} />
    </div>
  );
}
