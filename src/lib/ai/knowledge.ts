// 階段七:聊天機器人知識庫。
// - aggregateSiteContent():直讀資料來源(DB 已發布內容 + 階段一寫死區塊),組成原始文字。
//   ⚠️ 直讀來源而非 HTTP 爬蟲:同一個全端 App,直讀更準、更穩、自動排除草稿/隱藏頁。
// - condenseKnowledge():把原始文字丟 Gemini 濃縮成精簡、條理化的客服知識庫(中文)。
// - translateKnowledge():把目前中文知識庫丟 Gemini 翻成英文。
// 僅供 server 端使用(server action)。

import { prisma } from "@/lib/prisma";
import { dictionaries } from "@/lib/i18n/dictionary";
import { callGeminiText } from "./gemini";

const PUBLISHED = { status: "PUBLISHED" as const, deletedAt: null };

// 將全站可公開內容彙整成一段純文字(中文為主),作為濃縮的輸入素材。
export async function aggregateSiteContent(): Promise<string> {
  const [
    dashboardPosts,
    publications,
    teamMembers,
    alumni,
    jobs,
    blogPosts,
    courses,
    industryItems,
    highschool,
  ] = await Promise.all([
    prisma.dashboardPost.findMany({ where: PUBLISHED, orderBy: { publishedDate: "desc" } }),
    prisma.publication.findMany({ where: PUBLISHED, orderBy: { year: "desc" } }),
    prisma.teamMember.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
    prisma.alumnus.findMany({ where: PUBLISHED, orderBy: { gradYear: "desc" } }),
    prisma.jobOpening.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
    prisma.blogPost.findMany({ where: PUBLISHED, orderBy: { publishedDate: "desc" } }),
    prisma.course.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
    prisma.industryItem.findMany({ where: PUBLISHED, orderBy: { sortOrder: "asc" } }),
    prisma.highSchoolMessage.findFirst({ where: PUBLISHED, orderBy: { updatedAt: "desc" } }),
  ]);

  const zh = dictionaries.zh;
  const parts: string[] = [];

  // ── 寫死區塊(附錄 I:Hero / 研究領域 / PI 理念 / 應徵範本 / 聯絡資訊)──
  parts.push(
    `# 實驗室簡介\n${zh.home.heroTitle}。${zh.home.heroSubtitle}`,
  );
  parts.push(
    `# 研究領域\n` +
      zh.research.areas.map((a) => `- ${a.title}:${a.desc}`).join("\n"),
  );
  parts.push(`# 主持人(PI)理念\n${zh.home.philosophyBody.join("\n")}`);
  parts.push(
    `# 聯絡資訊\n實驗室:${zh.contact.labName}\n地址:${zh.contact.address}\n` +
      `Email:${zh.contact.email}\n電話:${zh.contact.phone}\n聯絡時間:${zh.contact.officeHours}\n` +
      `聯絡表單主題分類:${zh.contact.form.categories.industry}、${zh.contact.form.categories.academic}、${zh.contact.form.categories.recruit}`,
  );
  parts.push(`# 如何應徵 / 加入實驗室\n請至「團隊與招募」查看開放職缺,並透過「聯絡教授」頁送出應徵洽詢(主題選「應徵面談」)。應徵範本:\n${zh.team.templateBody}`);

  // ── 網站頁面導覽(幫機器人回答「某頁面在哪」)──
  parts.push(
    `# 網站頁面導覽\n` +
      [
        "首頁 /:實驗室簡介與主持人理念。",
        "研究與產學 /research:研究領域、代表著作、產學與專利。",
        "團隊與招募 /team:現役成員、歷屆成員去向、開放職缺、應徵範本。",
        "儀器介紹 /instruments:儀器介紹;登入會員後可線上預約。",
        "光電小講堂 /blog:科普文章。",
        "聯絡教授 /contact:線上聯絡表單。",
        "課程紀錄 /courses:課程大綱與講義。",
        "給高中生的話 /for-students:寫給高中生的引導文章。",
      ].join("\n"),
  );

  // ── 儀器預約規則摘要(導覽用,即時可約狀態請引導到儀器頁)──
  parts.push(
    `# 儀器預約規則(摘要)\n` +
      [
        "需為實驗室會員、登入後才能預約。",
        "以整點時段預約;使用時段一到自動簽到並產生簽退義務。",
        "使用後須於 3 天內以 QR 掃碼完成簽退,逾期標記為逾時未簽退。",
        "有效逾時未簽退達 3 筆會暫停預約權(不影響登入與簽退)。",
        "每人未來預約總時數有上限。",
        "某台儀器「現在」是否可約,請至儀器頁查看,聊天機器人不提供即時狀態。",
      ].join("\n"),
  );

  // ── DB 已發布內容 ──
  if (dashboardPosts.length) {
    parts.push(
      `# 最新動態/佈告欄\n` +
        dashboardPosts.map((p) => `- [${p.category}] ${p.title}:${p.body}`).join("\n"),
    );
  }
  if (publications.length) {
    parts.push(
      `# 著作 Publications\n` +
        publications
          .map(
            (p) =>
              `- ${p.authors} (${p.year}). ${p.title}. ${p.venue}.` +
              (p.abstract ? `\n  摘要:${p.abstract}` : ""),
          )
          .join("\n"),
    );
  }
  if (teamMembers.length) {
    parts.push(
      `# 現役成員\n` +
        teamMembers
          .map(
            (m) =>
              `- ${m.name}(${dictionaries.zh.team.tierLabels[m.tier] ?? m.tier})${m.researchTopic ? `:${m.researchTopic}` : ""}`,
          )
          .join("\n"),
    );
  }
  if (alumni.length) {
    parts.push(
      `# 歷屆成員去向\n` +
        alumni.map((a) => `- ${a.name}(${a.gradYear}):${a.destination}`).join("\n"),
    );
  }
  if (jobs.length) {
    parts.push(
      `# 開放職缺\n` +
        jobs
          .map((j) => `- ${j.title}(${j.recruitStatus === "OPEN" ? "開放" : "額滿"}):${j.description}`)
          .join("\n"),
    );
  }
  if (blogPosts.length) {
    parts.push(
      `# 部落格文章\n` +
        blogPosts
          .map((b) => `- ${b.titleZh}${b.summary ? `:${b.summary}` : ""}`)
          .join("\n"),
    );
  }
  if (courses.length) {
    parts.push(
      `# 課程紀錄\n` +
        courses.map((c) => `- ${c.name}:${c.outline}`).join("\n"),
    );
  }
  if (industryItems.length) {
    parts.push(
      `# 產學與專利\n` +
        industryItems.map((i) => `- [${i.category}] ${i.title}:${i.description}`).join("\n"),
    );
  }
  if (highschool?.content) {
    parts.push(`# 給高中生的話\n${highschool.content}`);
  }

  return parts.join("\n\n");
}

// 從 Tiptap doc JSON 遞迴抽出純文字(段落間以換行分隔)。
// 不引入瀏覽器版 tiptap,純走 JSON 結構即可。
function tiptapToPlainText(doc: unknown): string {
  const out: string[] = [];
  const walk = (node: unknown) => {
    if (!node || typeof node !== "object") return;
    const n = node as { type?: string; text?: string; content?: unknown[] };
    if (typeof n.text === "string") out.push(n.text);
    if (Array.isArray(n.content)) {
      n.content.forEach(walk);
      // 區塊級節點後補換行,讓段落不黏在一起。
      if (n.type && /paragraph|heading|listItem|blockquote/.test(n.type)) out.push("\n");
    }
  };
  walk(doc);
  return out.join("").replace(/\n{3,}/g, "\n\n").trim();
}

// 階段七方案 A:聊天時「問到才查」Blog 內文。
// 依 query 在已發布文章中比對(標題/摘要),回傳最相符那篇的純文字內文。
export async function getBlogContentByQuery(
  query: string,
  lang: "zh" | "en",
): Promise<string> {
  const posts = await prisma.blogPost.findMany({ where: PUBLISHED });
  if (!posts.length) {
    return lang === "en" ? "(No published blog posts.)" : "(目前沒有已發布的部落格文章。)";
  }

  const q = query.toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);
  let best: (typeof posts)[number] | null = null;
  let bestScore = 0;
  for (const p of posts) {
    const hay = `${p.titleZh} ${p.titleEn} ${p.summary ?? ""}`.toLowerCase();
    let score = 0;
    if (q && hay.includes(q)) score += 10;
    for (const tok of tokens) if (hay.includes(tok)) score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = p;
    }
  }
  if (!best || bestScore === 0) {
    return lang === "en"
      ? "(No blog post matches that topic.)"
      : "(找不到與該主題相符的文章。)";
  }

  const title = lang === "en" ? best.titleEn : best.titleZh;
  const body = tiptapToPlainText(lang === "en" ? best.bodyEn : best.bodyZh);
  return `${lang === "en" ? "Title" : "標題"}:${title}\n\n${body}`;
}

const CONDENSE_SYSTEM =
  "你是實驗室網站的客服知識庫編輯。將提供的全站原始內容,整理成一份『精簡、條理清楚、適合客服問答』的中文知識庫。" +
  "要求:用條列與小標題組織;保留具體事實(姓名、職缺、研究方向、聯絡方式、規則、頁面位置);去除重複與冗詞;" +
  "不要杜撰任何未出現於原始內容的事實;輸出純文字(可用 # 標題與 - 條列),不要包 code block 或 HTML。";

// 彙整全站內容 → Gemini 濃縮 → 回傳精簡中文知識庫。
export async function condenseKnowledge(): Promise<string> {
  const raw = await aggregateSiteContent();
  return callGeminiText(CONDENSE_SYSTEM, raw);
}

const TRANSLATE_SYSTEM =
  "你是專業中英翻譯。將提供的『中文客服知識庫』完整翻成自然、專業的英文,保留原本的標題與條列結構。" +
  "只翻譯,不要新增、刪減或改寫事實內容;輸出純文字,不要包 code block 或 HTML。";

// 將給定的中文知識庫翻成英文。
export async function translateKnowledge(zhText: string): Promise<string> {
  if (!zhText.trim()) throw new Error("中文知識庫為空,無法翻譯");
  return callGeminiText(TRANSLATE_SYSTEM, zhText);
}
