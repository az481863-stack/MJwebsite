// 樣板索引頁:給吳教授比較兩種風格方向用(非正式頁面)。
// 兩者皆維持「極簡學院風骨架 + awwwards 動態與層次」,差別在氛圍。

import Link from "next/link";

export const metadata = { title: "風格樣板比較 | Style Previews" };

const STYLES = [
  {
    href: "/preview/a",
    tag: "A",
    name: "暗色光學 Dark Optics",
    mood: "大膽、有記憶點",
    desc: "近黑底 Hero、動態雷射光束、科技藍綠重點色。視覺衝擊強,適合想讓人「一進來就記住」的方向。",
  },
  {
    href: "/preview/b",
    tag: "B",
    name: "淺色分層 Light Layered",
    mood: "精緻、克制、耐看",
    desc: "保留白色家族,但以分層灰、柔和陰影、深靛主色與捲動淡入打破單調。仍是嚴謹學術氣質,只是更有層次。",
  },
];

export default function PreviewIndex() {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 py-20 sm:py-28">
      <p className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
        Style Previews
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl">
        風格樣板比較
      </h1>
      <p className="mt-4 max-w-xl leading-relaxed text-muted">
        以下兩個樣板皆套用同一份內容,僅展示首頁的視覺方向。請點開比較後,告訴我偏好哪一個(或想各取哪些元素)。
      </p>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {STYLES.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="group flex flex-col border border-line p-7 transition-colors hover:border-line-strong"
          >
            <span className="font-mono text-sm text-muted">樣板 {s.tag}</span>
            <span className="mt-3 text-xl font-semibold">{s.name}</span>
            <span className="mt-1 text-sm text-muted">{s.mood}</span>
            <span className="mt-4 text-sm leading-relaxed text-foreground/75">
              {s.desc}
            </span>
            <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium">
              開啟樣板{" "}
              <span className="transition-transform group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
