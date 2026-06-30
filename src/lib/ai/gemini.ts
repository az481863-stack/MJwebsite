// AI 串接模組(階段六):Google Gemini。獨立封裝、與主流程隔離,便於日後換模型。
// 僅供 server 端使用(server action)。未設 GEMINI_API_KEY 時 isAiEnabled() 回 false,
// 前台不顯示 AI 入口,手填流程完全不受影響(AI 為加分項非地基)。

import { GoogleGenAI, Type } from "@google/genai";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export function isAiEnabled(): boolean {
  return !!process.env.GEMINI_API_KEY;
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 未設定");
  return new GoogleGenAI({ apiKey });
}

// 共用呼叫:帶 JSON schema 的 structured output,回傳已 parse 的物件。
async function callGeminiJson<T>(
  systemInstruction: string,
  userText: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  responseSchema: any,
): Promise<T> {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: userText,
    config: {
      systemInstruction,
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.2,
    },
  });
  const text = res.text;
  if (!text) throw new Error("AI 無回應");
  return JSON.parse(text) as T;
}

// 共用呼叫:純文字輸出(供階段七知識庫濃縮/翻譯)。
export async function callGeminiText(
  systemInstruction: string,
  userText: string,
): Promise<string> {
  const ai = getClient();
  const res = await ai.models.generateContent({
    model: MODEL,
    contents: userText,
    config: { systemInstruction, temperature: 0.3 },
  });
  const text = res.text;
  if (!text) throw new Error("AI 無回應");
  return text.trim();
}

export interface PublicationExtract {
  authors: string;
  title: string;
  venue: string;
  year: number;
  doiUrl: string;
  abstract: string;
}

// Publications:只「抽取」不可改寫。重點正確抓作者順序、期刊、年份、DOI。
export async function extractPublication(docText: string): Promise<PublicationExtract> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      authors: { type: Type.STRING, description: "作者,維持原文順序,以逗號分隔" },
      title: { type: Type.STRING, description: "論文標題" },
      venue: { type: Type.STRING, description: "期刊或會議名稱" },
      year: { type: Type.INTEGER, description: "發表年份(西元)" },
      doiUrl: { type: Type.STRING, description: "DOI 連結;無則空字串" },
      abstract: { type: Type.STRING, description: "論文摘要(abstract)原文;無則空字串" },
    },
    required: ["authors", "title", "venue", "year", "doiUrl", "abstract"],
    propertyOrdering: ["authors", "title", "venue", "year", "doiUrl", "abstract"],
  };
  const system =
    "你是學術論文書目資料抽取助手。只從提供的文件忠實『抽取』欄位,務必保持作者原始順序," +
    "不可改寫、翻譯或杜撰任何內容。摘要(abstract)若文件中有則原文抽取,沒有則給空字串。" +
    "找不到的欄位給空字串(年份找不到給 0)。若文件含多筆論文,只取第一筆。";
  return callGeminiJson<PublicationExtract>(system, docText, schema);
}

export interface BlogRewrite {
  titleZh: string;
  titleEn: string;
  summary: string;
  bodyHtmlZh: string;
  bodyHtmlEn: string;
}

// Blog:重寫整理 + 產出中英兩版。內文以簡單 HTML 輸出(段落/標題/粗體/清單)。
export async function rewriteBlog(docText: string): Promise<BlogRewrite> {
  const schema = {
    type: Type.OBJECT,
    properties: {
      titleZh: { type: Type.STRING, description: "中文標題" },
      titleEn: { type: Type.STRING, description: "英文標題" },
      summary: { type: Type.STRING, description: "一段簡短摘要(中文)" },
      bodyHtmlZh: {
        type: Type.STRING,
        description: "中文內文,簡單 HTML(僅用 <p><h2><h3><strong><em><ul><ol><li>)",
      },
      bodyHtmlEn: {
        type: Type.STRING,
        description: "英文內文,內容與中文版對應,簡單 HTML",
      },
    },
    required: ["titleZh", "titleEn", "summary", "bodyHtmlZh", "bodyHtmlEn"],
    propertyOrdering: ["titleZh", "titleEn", "summary", "bodyHtmlZh", "bodyHtmlEn"],
  };
  const system =
    "你是科普部落格編輯。將提供的文件重寫整理成通順、結構清楚的科普文章,並同時產出中文與英文兩個版本," +
    "兩版內容須對應。內文只使用簡單 HTML 標籤(<p>、<h2>、<h3>、<strong>、<em>、<ul>、<ol>、<li>)," +
    "不要包 <html>/<body>,不要使用 <img> 或行內樣式。忠於原意,不杜撰事實。";
  return callGeminiJson<BlogRewrite>(system, docText, schema);
}

// 通用「多欄位中→英翻譯」(供後台各內容類型的「一鍵翻譯」按鈕)。
// 傳入 { 欄位名: 中文值 },回傳 { 欄位名: 英文值 }。空值欄位略過。
// 以動態 JSON schema 強制逐鍵對應,避免漏譯/錯位。
export async function translateFieldsToEnglish(
  fields: Record<string, string>,
): Promise<Record<string, string>> {
  const keys = Object.keys(fields).filter((k) => fields[k]?.trim());
  if (keys.length === 0) return {};

  const schema = {
    type: Type.OBJECT,
    properties: Object.fromEntries(
      keys.map((k) => [k, { type: Type.STRING }]),
    ),
    required: keys,
    propertyOrdering: keys,
  };
  const system =
    "你是專業的繁體中文→英文翻譯。將使用者提供的 JSON 物件中每個欄位的『值』翻成自然、" +
    "專業且通順的英文,忠於原意、保留換行;不要新增或刪減欄位、不要翻譯鍵名(key)、" +
    "不要附加任何說明,直接回傳鍵相同的 JSON 物件。";
  const subset = Object.fromEntries(keys.map((k) => [k, fields[k]]));
  return callGeminiJson<Record<string, string>>(
    system,
    JSON.stringify(subset),
    schema,
  );
}
