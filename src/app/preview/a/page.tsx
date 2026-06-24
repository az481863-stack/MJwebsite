"use client";

// 樣板 A — 暗色光學(Dark Optics)
// 學院風骨架 + awwwards 動態:近黑 Hero、動態雷射光束、霓虹重點、捲動淡入。
// 重點色可由頁面底部調色盤即時切換(僅樣板比較用);光束採單色漸層,跟著主色走。
// 全部樣式區域化於本檔(scoped class 前綴 pa-),不影響全站 globals。

import Link from "next/link";
import { useState } from "react";
import { useLanguage } from "@/lib/i18n/context";
import { Reveal } from "../_components/Reveal";

// 暗底適用的「亮色霓虹」重點色,光束與光暈會跟著切換。
const PALETTES = [
  { key: "cyan", name: "青", main: "#22d3ee" },
  { key: "sky", name: "天藍", main: "#38bdf8" },
  { key: "teal", name: "藍綠", main: "#2dd4bf" },
  { key: "emerald", name: "翠綠", main: "#34d399" },
  { key: "lime", name: "萊姆", main: "#a3e635" },
  { key: "violet", name: "電紫", main: "#a78bfa" },
  { key: "fuchsia", name: "桃紫", main: "#e879f9" },
  { key: "rose", name: "玫紅", main: "#fb7185" },
  { key: "orange", name: "橙", main: "#fb923c" },
  { key: "amber", name: "琥珀", main: "#fbbf24" },
] as const;

export default function PreviewA() {
  const { t } = useLanguage();
  const h = t.home;
  const [pal, setPal] = useState<(typeof PALETTES)[number]>(PALETTES[0]);

  const rootStyle = { "--cy": pal.main } as React.CSSProperties;

  return (
    <div className="pa-root" style={rootStyle}>
      <style>{CSS}</style>

      {/* Hero(暗色 + 動態光路) */}
      <section className="pa-hero">
        <svg className="pa-beams" viewBox="0 0 1200 600" preserveAspectRatio="none" aria-hidden>
          <defs>
            <linearGradient id="pa-g1" x1="0" y1="0" x2="1" y2="1">
              <stop className="pa-s0" offset="0%" />
              <stop className="pa-s1" offset="50%" />
              <stop className="pa-s0" offset="100%" />
            </linearGradient>
          </defs>
          <line className="pa-beam" x1="-100" y1="120" x2="1300" y2="360" stroke="url(#pa-g1)" />
          <line className="pa-beam pa-beam2" x1="-100" y1="500" x2="1300" y2="180" stroke="url(#pa-g1)" />
          <line className="pa-beam pa-beam3" x1="200" y1="-50" x2="900" y2="650" stroke="url(#pa-g1)" />
        </svg>
        <div className="pa-glow" aria-hidden />

        <div className="pa-hero-inner">
          <p className="pa-eyebrow">{h.heroEyebrow}</p>
          <h1 className="pa-title">{h.heroTitle}</h1>
          <p className="pa-sub">{h.heroSubtitle}</p>
          <div className="pa-cta">
            <Link href="/research" className="pa-btn pa-btn-primary">
              {h.ctaPrimary}
            </Link>
            <Link href="/team" className="pa-btn pa-btn-ghost">
              {h.ctaSecondary}
            </Link>
          </div>
        </div>
        <div className="pa-scrollhint" aria-hidden>
          <span />
        </div>
      </section>

      {/* 研究領域 */}
      <section className="pa-section">
        <div className="pa-wrap">
          <Reveal as="header" className="pa-head">
            <h2 className="pa-h2">{h.researchHeading}</h2>
            <p className="pa-intro">{h.researchIntro}</p>
          </Reveal>
          <div className="pa-grid">
            {h.researchAreas.map((area, i) => (
              <Reveal key={i} delay={i * 90} className="pa-card">
                <span className="pa-num">0{i + 1}</span>
                <h3 className="pa-card-title">{area.title}</h3>
                <p className="pa-card-desc">{area.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 主持人理念(暗色帶) */}
      <section className="pa-section pa-dark">
        <svg className="pa-beams pa-beams-dim" viewBox="0 0 1200 400" preserveAspectRatio="none" aria-hidden>
          <line className="pa-beam" x1="-100" y1="80" x2="1300" y2="320" stroke="url(#pa-g1)" />
        </svg>
        <div className="pa-wrap">
          <Reveal as="h2" className="pa-h2 pa-h2-light">
            {h.philosophyHeading}
          </Reveal>
          <div className="pa-philo">
            {h.philosophyBody.map((p, i) => (
              <Reveal key={i} delay={i * 120} as="p" className="pa-philo-p">
                {p}
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* 動態佈告欄 */}
      <section className="pa-section">
        <div className="pa-wrap">
          <Reveal as="header" className="pa-head">
            <h2 className="pa-h2">{h.dashboardHeading}</h2>
            <p className="pa-intro">{h.dashboardIntro}</p>
          </Reveal>
          <ul className="pa-news">
            {h.dashboardItems.map((item, i) => (
              <Reveal key={i} delay={i * 80} as="li" className="pa-news-row">
                <span className="pa-news-tag">{item.tag}</span>
                <span className="pa-news-title">{item.title}</span>
                <span className="pa-news-date">{item.date}</span>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <div className="pa-switch">
        <Link href="/preview">← 樣板列表</Link>
        <Link href="/preview/b">看樣板 B →</Link>
      </div>

      {/* 調色盤(點擊切換重點色) */}
      <div className="pa-palette" role="group" aria-label="重點色切換">
        <span className="pa-palette-label">重點色</span>
        {PALETTES.map((p) => (
          <button
            key={p.key}
            type="button"
            onClick={() => setPal(p)}
            aria-pressed={pal.key === p.key}
            title={p.name}
            className={`pa-swatch ${pal.key === p.key ? "is-active" : ""}`}
            style={{ background: p.main }}
          >
            <span className="pa-swatch-name">{p.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

const CSS = `
.pa-root{--ink:#0a0b10;--cy:#22d3ee;background:#fff;color:#111}
.reveal{opacity:0;transform:translateY(24px);transition:opacity .7s cubic-bezier(.16,1,.3,1),transform .7s cubic-bezier(.16,1,.3,1)}
.reveal[data-shown="true"]{opacity:1;transform:none}
.pa-s0{stop-color:var(--cy);stop-opacity:0}
.pa-s1{stop-color:var(--cy);stop-opacity:.9}

.pa-hero{position:relative;overflow:hidden;background:var(--ink);color:#fff;min-height:88vh;display:flex;align-items:center}
.pa-hero-inner{position:relative;z-index:2;max-width:62rem;margin:0 auto;padding:7rem 1.5rem;width:100%}
.pa-beams{position:absolute;inset:0;width:100%;height:100%;z-index:1}
.pa-beam{stroke-width:1.5;stroke-dasharray:1600;stroke-dashoffset:1600;animation:pa-draw 2.6s ease forwards,pa-pulse 6s ease-in-out infinite 2.6s}
.pa-beam2{animation-delay:.5s,3.1s}
.pa-beam3{animation-delay:1s,3.6s;stroke-width:1}
.pa-beams-dim{opacity:.35}
@keyframes pa-draw{to{stroke-dashoffset:0}}
@keyframes pa-pulse{0%,100%{opacity:.4}50%{opacity:1}}
.pa-glow{position:absolute;z-index:0;right:-10%;top:10%;width:50vw;height:50vw;background:radial-gradient(circle,color-mix(in srgb,var(--cy) 20%,transparent),transparent 60%);filter:blur(20px);animation:pa-float 9s ease-in-out infinite}
@keyframes pa-float{0%,100%{transform:translateY(0)}50%{transform:translateY(-30px)}}
.pa-eyebrow{font-size:.72rem;letter-spacing:.22em;text-transform:uppercase;color:var(--cy);font-family:var(--font-geist-mono),monospace;animation:pa-up .8s ease both}
.pa-title{font-size:clamp(2.4rem,6vw,4.6rem);line-height:1.05;font-weight:600;letter-spacing:-.02em;margin-top:1.4rem;max-width:18ch;animation:pa-up .9s ease .1s both}
.pa-sub{margin-top:1.6rem;max-width:42rem;font-size:1.1rem;line-height:1.8;color:rgba(255,255,255,.72);animation:pa-up .9s ease .2s both}
.pa-cta{margin-top:2.6rem;display:flex;gap:.9rem;flex-wrap:wrap;animation:pa-up .9s ease .3s both}
@keyframes pa-up{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
.pa-btn{display:inline-flex;align-items:center;padding:.85rem 1.6rem;font-size:.9rem;font-weight:500;border-radius:2px;transition:transform .2s,box-shadow .2s,background .2s,color .2s}
.pa-btn-primary{background:var(--cy);color:#06121a;box-shadow:0 0 0 transparent}
.pa-btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px color-mix(in srgb,var(--cy) 38%,transparent)}
.pa-btn-ghost{border:1px solid rgba(255,255,255,.3);color:#fff}
.pa-btn-ghost:hover{background:#fff;color:var(--ink)}
.pa-scrollhint{position:absolute;left:50%;bottom:28px;transform:translateX(-50%);z-index:2}
.pa-scrollhint span{display:block;width:1px;height:42px;background:linear-gradient(var(--cy),transparent);animation:pa-scroll 1.8s ease-in-out infinite}
@keyframes pa-scroll{0%{transform:scaleY(0);transform-origin:top}50%{transform:scaleY(1);transform-origin:top}51%{transform-origin:bottom}100%{transform:scaleY(0);transform-origin:bottom}}

.pa-section{padding:6rem 0;position:relative;overflow:hidden}
.pa-wrap{max-width:62rem;margin:0 auto;padding:0 1.5rem;position:relative;z-index:2}
.pa-head{margin-bottom:3rem}
.pa-h2{font-size:clamp(1.6rem,3.5vw,2.3rem);font-weight:600;letter-spacing:-.01em}
.pa-h2-light{color:#fff}
.pa-intro{margin-top:.8rem;max-width:40rem;color:#6b6b6b;line-height:1.7}
.pa-grid{display:grid;gap:1px;background:#e5e5e5;border:1px solid #e5e5e5}
@media(min-width:640px){.pa-grid{grid-template-columns:repeat(3,1fr)}}
.pa-card{background:#fff;padding:2.2rem;transition:opacity .7s,transform .7s,box-shadow .3s,background .3s}
.pa-card:hover{box-shadow:inset 0 3px 0 var(--cy)}
.pa-num{font-family:var(--font-geist-mono),monospace;color:var(--cy);font-size:.9rem}
.pa-card-title{margin-top:1rem;font-size:1.15rem;font-weight:600}
.pa-card-desc{margin-top:.8rem;font-size:.92rem;line-height:1.7;color:#6b6b6b}

.pa-dark{background:var(--ink);color:#fff}
.pa-philo{margin-top:2rem;max-width:46rem;display:flex;flex-direction:column;gap:1.4rem}
.pa-philo-p{font-size:1.12rem;line-height:1.9;color:rgba(255,255,255,.78)}

.pa-news{border-top:1px solid #e5e5e5}
.pa-news-row{display:flex;align-items:center;gap:1.2rem;padding:1.35rem .2rem;border-bottom:1px solid #e5e5e5;transition:opacity .7s,transform .7s,padding-left .25s,background .25s}
.pa-news-row:hover{padding-left:1rem;background:color-mix(in srgb,var(--cy) 9%,transparent)}
.pa-news-tag{width:6.5rem;flex:none;font-size:.72rem;letter-spacing:.08em;text-transform:uppercase;color:var(--cy)}
.pa-news-title{flex:1;font-size:1rem}
.pa-news-date{flex:none;font-family:var(--font-geist-mono),monospace;font-size:.85rem;color:#6b6b6b}

.pa-switch{display:flex;justify-content:space-between;max-width:62rem;margin:0 auto;padding:2rem 1.5rem 7rem;font-size:.9rem;font-weight:500}
.pa-switch a:hover{color:var(--cy)}

.pa-palette{position:fixed;left:50%;bottom:1.1rem;transform:translateX(-50%);z-index:50;display:flex;align-items:center;gap:.5rem;padding:.6rem .9rem;max-width:calc(100vw - 2rem);flex-wrap:wrap;justify-content:center;background:rgba(12,13,18,.82);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,.14);border-radius:18px;box-shadow:0 10px 34px rgba(0,0,0,.4)}
.pa-palette-label{font-size:.72rem;color:rgba(255,255,255,.6);margin-right:.1rem}
.pa-swatch{position:relative;width:26px;height:26px;border-radius:999px;border:2px solid rgba(255,255,255,.85);box-shadow:0 0 0 1px rgba(0,0,0,.3);cursor:pointer;transition:transform .15s,box-shadow .15s}
.pa-swatch:hover{transform:scale(1.12)}
.pa-swatch.is-active{box-shadow:0 0 0 2px var(--ink),0 0 0 4px #fff}
.pa-swatch-name{position:absolute;bottom:130%;left:50%;transform:translateX(-50%);font-size:.7rem;white-space:nowrap;background:#fff;color:var(--ink);padding:.15rem .45rem;border-radius:4px;opacity:0;pointer-events:none;transition:opacity .15s}
.pa-swatch:hover .pa-swatch-name{opacity:1}
`;
