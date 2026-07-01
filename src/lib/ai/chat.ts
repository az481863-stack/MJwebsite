// 階段七:聊天機器人對話(Gemini streaming + function calling + 組 system prompt)。
// 定位為導覽/客服:只依知識庫回答與本實驗室/網站相關問題,不查即時狀態、不代操作。
// 方案 A:Blog 內文「問到才查」——提供 getBlogContent 工具,模型需要時才撈該篇全文。
//   (Blog 為已發布的靜態內容,問到才檢索合理;即時狀態如儀器可約與否仍一律導向頁面。)
// 僅供 server 端使用(/api/chat route)。

import { GoogleGenAI, Type, type FunctionCall } from "@google/genai";
import { getBlogContentByQuery } from "./knowledge";

const MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

export type ChatRole = "user" | "model";
export interface ChatMessage {
  role: ChatRole;
  text: string;
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY 未設定");
  return new GoogleGenAI({ apiKey });
}

// Blog 內文檢索工具宣告(function calling)。
const blogTool = {
  functionDeclarations: [
    {
      name: "getBlogContent",
      description:
        "查詢「光電小講堂 Blog」某篇文章的完整內文。當使用者問到某篇科普文章/部落格主題的細節," +
        "而知識庫只有標題與摘要時,用本工具取得該篇全文再回答。query 傳文章標題或主題關鍵字。",
      parameters: {
        type: Type.OBJECT,
        properties: {
          query: { type: Type.STRING, description: "文章標題或主題關鍵字" },
        },
        required: ["query"],
      },
    },
  ],
};

// 組 system prompt:護欄 + 知識庫。語言依使用者提問語言。
function buildSystemPrompt(lang: "zh" | "en", knowledge: string): string {
  const kb = knowledge.trim() || (lang === "en" ? "(empty)" : "(尚無內容)");
  if (lang === "en") {
    return [
      "You are the helpful assistant for the Optoelectronic Physics Lab website (a navigation/FAQ assistant).",
      "Rules:",
      "- Answer ONLY questions about this lab and this website, using the knowledge base below.",
      "- For details of a specific blog post, call the getBlogContent tool to fetch its full text, then answer from it.",
      "- If neither the knowledge base nor a fetched blog post contains the answer, say you are not sure and guide the user to the Contact page. Never invent names, publications, numbers or facts.",
      "- For real-time data (e.g. whether a specific instrument is available right now), do not guess — direct the user to the relevant page (e.g. the Instruments page).",
      "- When asked whether the lab has a certain instrument: only if it appears in the instrument list in the knowledge base, confirm it and give a deep link [name](/instruments?q=name) so the user can view/book it. If it is NOT in the list, say the lab does not have it and point to the Contact page — never invent an instrument or a link.",
      "- For unrelated questions, politely decline and steer back to lab/website topics.",
      "- When directing the user to a page, ALWAYS give a clickable Markdown link, e.g. [Contact](/contact). Use these paths: Home /, Research & Industry /research, Lab Team /team, Instruments /instruments, Blog /blog, Contact /contact, Courses /courses, For High-School Students /for-students.",
      "- Reply in English. Keep answers concise and friendly.",
      "",
      "=== KNOWLEDGE BASE ===",
      kb,
    ].join("\n");
  }
  return [
    "你是「光電物理實驗室」網站的客服助理(導覽/FAQ 助理)。",
    "規則:",
    "- 只回答與本實驗室、本網站相關的問題,依據下方「知識庫」內容回答。",
    "- 若使用者問到某篇部落格文章的細節,請呼叫 getBlogContent 工具取得該篇全文後再回答。",
    "- 知識庫與所取得的文章都沒有答案時,坦白說不確定並引導到「聯絡教授」頁;絕不杜撰人名、論文、數據或任何事實。",
    "- 涉及即時資料(例如某台儀器現在是否可預約)不要臆測,改引導使用者到對應頁面(如儀器頁)。",
    "- 被問到「實驗室有沒有某台儀器」時:僅當該儀器出現在知識庫的「儀器清單」中,才確認有並附上深連結 [儀器名](/instruments?q=儀器名),讓使用者點進去查看/預約;若清單中沒有,就據實說明目前沒有這台並引導到「聯絡教授」頁,絕不杜撰儀器或連結。",
    "- 與實驗室/網站無關的問題,禮貌婉拒並把話題引回。",
    "- 需要引導使用者到某頁面時,務必用 Markdown 連結格式給可點擊連結,例如 [聯絡教授](/contact)。頁面路徑:首頁 /、研究與產學 /research、團隊與招募 /team、儀器介紹 /instruments、光電小講堂 /blog、聯絡教授 /contact、課程紀錄 /courses、給高中生的話 /for-students。",
    "- 以繁體中文回答,簡潔友善。",
    "",
    "=== 知識庫 ===",
    kb,
  ].join("\n");
}

// ── 管理員小幫手(後台「使用說明」頁專用) ──────────────────────
// 定位:協助管理員/助教操作後台。只依「使用說明」內容回答,不代操作、不查即時 DB。
// 後台一律中文;無 function calling、無工具(知識即說明頁全文,量小可直接放入)。

function buildAdminSystemPrompt(guide: string): string {
  const kb = guide.trim() || "(尚無使用說明內容)";
  return [
    "你是本網站「後台管理系統」的管理員小幫手,協助管理員/助教操作後台",
    "(例如:發布內容、審核學生草稿、邀請會員、管理儀器、調整網站設定、維護聊天機器人知識庫等)。",
    "規則:",
    "- 只依據下方「使用說明」內容回答後台操作問題。",
    "- 使用說明沒有寫到的,坦白說不確定,建議查看完整說明或詢問系統開發者;絕不杜撰功能、步驟或選單位置。",
    "- 你只提供操作指引,不代替使用者執行任何動作,也不查詢即時資料。",
    "- 與後台操作、本網站無關的問題,禮貌婉拒並把話題引回。",
    "- 以繁體中文回答,簡潔、條列清楚、友善。",
    "",
    "=== 使用說明 ===",
    kb,
  ].join("\n");
}

// 串流回應(管理員小幫手):無工具,單輪串流。
export async function* streamAdminChat(
  messages: ChatMessage[],
  guide: string,
): AsyncGenerator<string> {
  const ai = getClient();
  const systemInstruction = buildAdminSystemPrompt(guide);
  const contents = messages.map((m) => ({ role: m.role, parts: [{ text: m.text }] }));

  let yieldedAny = false;
  const stream = await ai.models.generateContentStream({
    model: MODEL,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contents: contents as any,
    config: { systemInstruction, temperature: 0.3 },
  });
  for await (const chunk of stream) {
    const t = chunk.text;
    if (t) {
      yieldedAny = true;
      yield t;
    }
  }
  if (!yieldedAny) {
    console.error("[admin-chat] model returned no text (possible safety block).");
    yield "抱歉,我這次沒能產生回答,請重新描述問題,或查看上方完整使用說明。";
  }
}

// 執行模型要求的工具呼叫。
async function runTool(call: FunctionCall, lang: "zh" | "en"): Promise<string> {
  if (call.name === "getBlogContent") {
    const query = String((call.args as { query?: unknown })?.query ?? "");
    return getBlogContentByQuery(query, lang);
  }
  return lang === "en" ? "(unknown tool)" : "(未知工具)";
}

// 串流回應:回傳逐段吐出文字的 async generator。
// 內含 function-calling 迴圈:模型先(可能)呼叫工具取 Blog 內文,再串流最終答案。
export async function* streamChat(
  messages: ChatMessage[],
  lang: "zh" | "en",
  knowledge: string,
): AsyncGenerator<string> {
  const ai = getClient();
  const systemInstruction = buildSystemPrompt(lang, knowledge);
  // 用可變陣列累積對話(含工具往返)。
  const contents: unknown[] = messages.map((m) => ({
    role: m.role,
    parts: [{ text: m.text }],
  }));

  // 追蹤整段對話是否吐出過任何文字;若全程沉默,結尾回一句 fallback,
  // 避免使用者看到「完全空白」(safety filter 擋掉、或工具迴圈耗盡等情況)。
  let yieldedAny = false;

  // 最多 3 輪:容納「模型呼叫工具 → 我們回傳結果 → 模型再答」。
  for (let round = 0; round < 3; round++) {
    const stream = await ai.models.generateContentStream({
      model: MODEL,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      contents: contents as any,
      config: { systemInstruction, tools: [blogTool], temperature: 0.4 },
    });

    const calls: FunctionCall[] = [];
    for await (const chunk of stream) {
      if (chunk.functionCalls?.length) calls.push(...chunk.functionCalls);
      const t = chunk.text;
      if (t) {
        yieldedAny = true;
        yield t;
      }
    }

    if (calls.length === 0) {
      // 沒有工具呼叫 = 已是最終答案。若全程沒吐任何文字,補一句 fallback。
      if (!yieldedAny) {
        console.error("[chat] model returned no text (possible safety block).");
        yield lang === "en"
          ? "Sorry, I'm not sure about that. Please see the [Contact](/contact) page."
          : "抱歉,我不太確定這個問題,請參考[聯絡教授](/contact)頁面。";
      }
      return;
    }

    // 把模型的工具呼叫與我們的回應接回對話,進入下一輪取最終答案。
    contents.push({ role: "model", parts: calls.map((c) => ({ functionCall: c })) });
    const responseParts = [];
    for (const call of calls) {
      const result = await runTool(call, lang);
      responseParts.push({
        functionResponse: { name: call.name, response: { result } },
      });
    }
    contents.push({ role: "user", parts: responseParts });
  }

  // 3 輪工具迴圈耗盡仍無最終答案:補一句 fallback,避免靜默。
  if (!yieldedAny) {
    console.error("[chat] tool loop exhausted without a final answer.");
    yield lang === "en"
      ? "Sorry, I couldn't complete that. Please see the [Contact](/contact) page."
      : "抱歉,我暫時無法完成這個查詢,請參考[聯絡教授](/contact)頁面。";
  }
}
