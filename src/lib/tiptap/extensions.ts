// Tiptap 共用擴充(編輯器與前台渲染共用,確保輸入輸出一致)。
// StarterKit v3 已含 Bold/Italic/Underline/Strike/Code/CodeBlock/HorizontalRule/Heading/
// List/Blockquote/Link;其餘為加裝。數學公式於前台以 KaTeX client 端渲染(見 MathUpgrader)。

import StarterKit from "@tiptap/starter-kit";
import Image from "@tiptap/extension-image";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import {
  Table,
  TableRow,
  TableHeader,
  TableCell,
} from "@tiptap/extension-table";
import { InlineMath, BlockMath } from "@tiptap/extension-mathematics";

export const tiptapExtensions = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    link: {
      openOnClick: false,
      autolink: true,
      HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
    },
  }),
  Image.configure({ HTMLAttributes: { class: "rich-text-img" } }),
  Subscript,
  Superscript,
  Highlight,
  TextAlign.configure({ types: ["heading", "paragraph"] }),
  Table.configure({ resizable: false }),
  TableRow,
  TableHeader,
  TableCell,
  InlineMath,
  BlockMath,
];
