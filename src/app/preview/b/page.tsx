"use client";

// 樣板 B — 淺色分層(Light Layered)
// 學院風骨架 + awwwards 細節:分層灰底、白卡浮起、深靛重點、捲動淡入、細光路線。
// 仍是嚴謹學術氣質,只是以層次與微動態打破「太白太單調」。
// 主色可由頁面右下角調色盤即時切換(僅樣板比較用)。
// 樣式區域化於本檔(scoped class 前綴 pb-),不影響全站 globals。

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Reveal } from "../_components/Reveal";

// 主色候選:皆為學術網站耐看的深色系。soft(淺底)與 grad(理念區漸層)
// 由 main 以 color-mix 自動衍生,方便擴充。
const PALETTES = [
  { key: "indigo", name: "靛藍", main: "#4338ca" },
  { key: "blue", name: "墨藍", main: "#1d4ed8" },
  { key: "royal", name: "寶藍", main: "#2563eb" },
  { key: "steel", name: "鋼藍", main: "#1e5a8a" },
  { key: "teal", name: "靛青", main: "#0e7490" },
  { key: "cyan", name: "青藍", main: "#0891b2" },
  { key: "emerald", name: "翠綠", main: "#047857" },
  { key: "forest", name: "森綠", main: "#15803d" },
  { key: "purple", name: "紫", main: "#6d28d9" },
  { key: "plum", name: "梅紫", main: "#86198f" },
  { key: "burgundy", name: "酒紅", main: "#9b1c31" },
  { key: "rose", name: "玫瑰", main: "#be123c" },
  { key: "rust", name: "磚橙", main: "#b45309" },
  { key: "brown", name: "棕", main: "#78350f" },
  { key: "slate", name: "鋼灰", main: "#475569" },
  { key: "graphite", name: "石墨", main: "#334155" },
] as const;

// 由主色衍生淺底與漸層(深 → 主色 → 淺)。
function softOf(main: string) {
  return `color-mix(in srgb, ${main} 11%, white)`;
}
function gradOf(main: string) {
  return `linear-gradient(135deg, color-mix(in srgb,${main} 72%,#000) 0%, ${main} 55%, color-mix(in srgb,${main} 70%,#fff) 100%)`;
}

export default function PreviewB() {
  const { t } = useLanguage();
  const h = t.home;
  const [pal, setPal] = useState(PALETTES[0]);

  const rootStyle = {
    "--indigo": pal.main,
    "--indigo-soft": softOf(pal.main),
    "--indigo-grad": gradOf(pal.main),
  } as React.CSSProperties;

  return (
    <div className="pb-root" style={rootStyle}>
      <style>{CSS}</style>

      {/* Hero(淺色分層 + 細光路) */}
      <section className="pb-hero">
        <svg className="pb-lines" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden>
          <line className="pb-line" x1="-50" y1="160" x2="1250" y2="300" />
          <line className="pb-line pb-line2" x1="-50" y1="460" x2="1250" y2="240" />
          <circle className="pb-node" cx="840" cy="270" r="4" />
          <circle className="pb-node pb-node2" cx="360" cy="372" r="3" />
        </svg>

        <div className="pb-hero-inner">
          <Reveal as="p" className="pb-eyebrow">
            {h.heroEyebrow}
          </Reveal>
          <Reveal as="h1" className="pb-title" delay={80}>
            {h.heroTitle}
          </Reveal>
          <Reveal as="p" className="pb-sub" delay={160}>
            {h.heroSubtitle}
          </Reveal>
          <Reveal className="pb-cta" delay={240}>
            <Link href="/research" className="pb-btn pb-btn-primary">
              {h.ctaPrimary}
            </Link>
            <Link href="/team" className="pb-btn pb-btn-ghost">
              {h.ctaSecondary}
            </Link>
          </Reveal>
        </div>
      </section>

      {/* 研究領域(白卡浮於淺灰底) */}
      <section className="pb-section">
        <div className="pb-wrap">
          <Reveal as="header" className="pb-head">
            <span className="pb-kicker">01 — Research</span>
            <h2 className="pb-h2">{h.researchHeading}</h2>
            <p className="pb-intro">{h.researchIntro}</p>
          </Reveal>
          <div className="pb-grid">
            {h.researchAreas.map((area, i) => (
              <Reveal key={i} delay={i * 100} className="pb-card">
                <span className="pb-num">0{i + 1}</span>
                <h3 className="pb-card-title">{area.title}</h3>
                <p className="pb-card-desc">{area.desc}</p>
                <span className="pb-card-line" />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 主持人理念(主色襯底) */}
      <section className="pb-section pb-tint">
        <div className="pb-wrap">
          <Reveal as="header" className="pb-head">
            <span className="pb-kicker pb-kicker-light">02 — Philosophy</span>
            <h2 className="pb-h2 pb-h2-light">{h.philosophyHeading}</h2>
          </Reveal>
          <div className="pb-philo">
            {h.philosophyBody.map((p, i) => (
              <Reveal key={i} delay={i * 120} as="p" className="pb-philo-p">
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 動態佈告欄 */}
      <section className="pb-section">
        <div className="pb-wrap">
          <Reveal as="header" className="pb-head">
            <span className="pb-kicker">03 — News</span>
            <h2 className="pb-h2">{h.dashboardHeading}</h2>
            <p className="pb-intro">{h.dashboardIntro}</p>
          </Reveal>
          <ul className="pb-news">
            {h.dashboardItems.map((item, i) => (
              <Reveal key={i} delay={i * 80} as="li" className="pb-news-row">
                <span className="pb-news-tag">{item.tag}</span>
                <span className="pb-news-title">{item.title}</span>
                <span className="pb-news-date">{item.date}</span>
                <span className="pb-news-arrow" aria-hidden>→</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <div className="pb-switch">
        <Link href="/preview">← 樣板列表</Link>
        <Link href="/preview/a">看樣板 A →</Link>
      </div>

      {/* 調色盤(點擊切換主色) */}
      <div className="pb-palette" role="group" aria-label="主色切換">
        <span className="pb-palette-label">主色</span>
        {PALETTES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPal(p)}
            aria-pressed={pal.key === p.key}
            title={p.name}
            className={`pb-swatch ${pal.key === p.key ? "is-active" : ""}`}
            style={{ background: p.main }}
          >
            <span className="pb-swatch-name">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.pb-root{--paper:#f5f6f8;--ink:#15171c;--indigo:#4338ca;--indigo-soft:#eef0fb;--indigo-grad:linear-gradient(135deg,#3b32b0,#4338ca 60%,#5b4fe0);color:var(--ink);background:var(--paper)}
.reveal{opacity:0;transform:translateY(22px);transition:opacity .8s cubic-bezier(.16,1,.3,1),transform .8s cubic-bezier(.16,1,.3,1)}
.reveal[data-shown="true"]{opacity:1;transform:none}

.pb-hero{position:relative;overflow:hidden;background:linear-gradient(180deg,#fbfcfd 0%,#eef0f4 100%);min-height:82vh;display:flex;align-items:center}
.pb-hero-inner{position:relative;z-index:2;max-width:62rem;margin:0 auto;padding:7rem 1.5rem;width:100%}
.pb-lines{position:absolute;inset:0;width:100%;height:100%;z-index:1}
.pb-line{stroke:var(--indigo);stroke-width:1;opacity:.18;stroke-dasharray:1500;stroke-dashoffset:1500;animation:pb-draw 2.4s ease forwards}
.pb-line2{animation-delay:.4s;opacity:.12}
@keyframes pb-draw{to{stroke-dashoffset:0}}
.pb-node{fill:var(--indigo);opacity:0;animation:pb-pop .5s ease 2.2s forwards,pb-blink 4s ease-in-out 2.7s infinite}
.pb-node2{animation-delay:2.5s,3s}
@keyframes pb-pop{to{opacity:.85}}
@keyframes pb-blink{0%,100%{opacity:.85}50%{opacity:.3}}
.pb-eyebrow{font-size:.72rem;letter-spacing:.2em;text-transform:uppercase;color:var(--indigo);font-family:var(--font-geist-mono),monospace;font-weight:500}
.pb-title{font-size:clamp(2.4rem,6vw,4.4rem);line-height:1.07;font-weight:600;letter-spacing:-.02em;margin-top:1.3rem;max-width:18ch}
.pb-sub{margin-top:1.5rem;max-width:42rem;font-size:1.1rem;line-height:1.8;color:#54585f}
.pb-cta{margin-top:2.4rem;display:flex;gap:.9rem;flex-wrap:wrap}
.pb-btn{display:inline-flex;align-items:center;padding:.85rem 1.7rem;font-size:.9rem;font-weight:500;border-radius:3px;transition:transform .2s,box-shadow .2s,background .2s,color .2s,border-color .2s}
.pb-btn-primary{background:var(--indigo);color:#fff;box-shadow:0 6px 20px color-mix(in srgb,var(--indigo) 22%,transparent)}
.pb-btn-primary:hover{transform:translateY(-2px);box-shadow:0 12px 32px color-mix(in srgb,var(--indigo) 32%,transparent)}
.pb-btn-ghost{border:1px solid #c8cad2;color:var(--ink);background:rgba(255,255,255,.6)}
.pb-btn-ghost:hover{border-color:var(--ink);background:#fff}

.pb-section{padding:6rem 0}
.pb-wrap{max-width:62rem;margin:0 auto;padding:0 1.5rem}
.pb-head{margin-bottom:3rem}
.pb-kicker{font-family:var(--font-geist-mono),monospace;font-size:.75rem;letter-spacing:.12em;color:var(--indigo)}
.pb-kicker-light{color:rgba(255,255,255,.65)}
.pb-h2{font-size:clamp(1.7rem,3.5vw,2.4rem);font-weight:600;letter-spacing:-.01em;margin-top:.7rem}
.pb-h2-light{color:#fff}
.pb-intro{margin-top:.8rem;max-width:40rem;color:#54585f;line-height:1.7}
.pb-grid{display:grid;gap:1.4rem}
@media(min-width:640px){.pb-grid{grid-template-columns:repeat(3,1fr)}}
.pb-card{position:relative;background:#fff;padding:2.1rem;border-radius:6px;box-shadow:0 1px 2px rgba(20,23,28,.04),0 8px 24px rgba(20,23,28,.05);transition:opacity .8s,transform .8s,box-shadow .35s}
.pb-card:hover{transform:translateY(-6px);box-shadow:0 2px 4px rgba(20,23,28,.05),0 18px 44px color-mix(in srgb,var(--indigo) 16%,transparent)}
.pb-num{font-family:var(--font-geist-mono),monospace;color:var(--indigo);font-size:.9rem}
.pb-card-title{margin-top:1rem;font-size:1.15rem;font-weight:600}
.pb-card-desc{margin-top:.8rem;font-size:.92rem;line-height:1.7;color:#54585f}
.pb-card-line{display:block;margin-top:1.4rem;height:2px;width:28px;background:var(--indigo);border-radius:2px;transition:width .35s}
.pb-card:hover .pb-card-line{width:56px}

.pb-tint{background:var(--indigo-grad);color:#fff}
.pb-philo{max-width:46rem;display:flex;flex-direction:column;gap:1.4rem}
.pb-philo-p{font-size:1.14rem;line-height:1.9;color:rgba(255,255,255,.82)}

.pb-news{border-top:1px solid #e1e3e8}
.pb-news-row{display:flex;align-items:center;gap:1.2rem;padding:1.4rem .4rem;border-bottom:1px solid #e1e3e8;transition:opacity .8s,transform .8s,padding-left .25s,background .25s}
.pb-news-row:hover{padding-left:1.1rem;background:var(--indigo-soft)}
.pb-news-tag{width:6.5rem;flex:none;font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--indigo)}
.pb-news-title{flex:1;font-size:1rem}
.pb-news-date{flex:none;font-family:var(--font-geist-mono),monospace;font-size:.85rem;color:#8a8e96}
.pb-news-arrow{flex:none;color:var(--indigo);opacity:0;transform:translateX(-6px);transition:opacity .25s,transform .25s}
.pb-news-row:hover .pb-news-arrow{opacity:1;transform:none}

.pb-switch{display:flex;justify-content:space-between;max-width:62rem;margin:0 auto;padding:2rem 1.5rem 7rem;font-size:.9rem;font-weight:500}
.pb-switch a:hover{color:var(--indigo)}

.pb-palette{position:fixed;left:50%;bottom:1.1rem;transform:translateX(-50%);z-index:50;display:flex;align-items:center;justify-content:center;flex-wrap:wrap;gap:.55rem;padding:.6rem .9rem;max-width:calc(100vw - 2rem);background:rgba(255,255,255,.88);backdrop-filter:blur(10px);border:1px solid #e1e3e8;border-radius:18px;box-shadow:0 8px 30px rgba(20,23,28,.12)}
.pb-palette-label{font-size:.72rem;color:#8a8e96;margin-right:.1rem}
.pb-swatch{position:relative;width:26px;height:26px;border-radius:999px;border:2px solid #fff;box-shadow:0 0 0 1px #d8dae1;cursor:pointer;transition:transform .15s,box-shadow .15s}
.pb-swatch:hover{transform:scale(1.12)}
.pb-swatch.is-active{box-shadow:0 0 0 2px #fff,0 0 0 4px var(--ink)}
.pb-swatch-name{position:absolute;bottom:130%;left:50%;transform:translateX(-50%);font-size:.7rem;white-space:nowrap;background:var(--ink);color:#fff;padding:.15rem .45rem;border-radius:4px;opacity:0;pointer-events:none;transition:opacity .15s}
.pb-swatch:hover .pb-swatch-name{opacity:1}
`;
