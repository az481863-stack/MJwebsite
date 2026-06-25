// Dark Optics 主題的重點色定義(單一事實來源)。
// 後台 Settings 的調色盤、前台主色套用都讀這裡。新增顏色只要加一行。
// 色值為暗底適用的亮色霓虹;存於 SiteSettings.siteAccent 的是 key。

export interface AccentOption {
  key: string;
  name: string; // 後台顯示用中文名
  hex: string;
}

export const ACCENTS: AccentOption[] = [
  { key: "cyan", name: "青", hex: "#22d3ee" },
  { key: "sky", name: "天藍", hex: "#38bdf8" },
  { key: "teal", name: "藍綠", hex: "#2dd4bf" },
  { key: "emerald", name: "翠綠", hex: "#34d399" },
  { key: "lime", name: "萊姆", hex: "#a3e635" },
  { key: "violet", name: "電紫", hex: "#a78bfa" },
  { key: "fuchsia", name: "桃紫", hex: "#e879f9" },
  { key: "rose", name: "玫紅", hex: "#fb7185" },
  { key: "orange", name: "橙", hex: "#fb923c" },
  { key: "amber", name: "琥珀", hex: "#fbbf24" },
];

export const DEFAULT_ACCENT = "cyan";

export function accentHex(key: string | undefined | null): string {
  return ACCENTS.find((a) => a.key === key)?.hex ?? ACCENTS[0].hex;
}

export function isAccentKey(key: string): boolean {
  return ACCENTS.some((a) => a.key === key);
}
