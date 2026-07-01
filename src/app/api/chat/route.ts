// 階段七:聊天機器人 API。POST { messages, lang } → 串流回傳文字。
// 護欄/知識庫見 src/lib/ai/chat.ts;知識來源為 Settings 的中/英知識庫(維護時譯好)。
// 防濫用:多段 IP 速率限制(DB 持久化)+ 單則長度上限 + 單輪則數上限。
// 限流見 src/lib/ratelimit.ts 的 CHAT_RATE_WINDOWS(每小時 50 / 每 6 小時 100 /
// 每日 150 / 每月 500),存 DB 故跨 serverless 實例、冷啟動皆準(取代舊記憶體版)。

import { NextResponse } from "next/server";
import { isAiEnabled } from "@/lib/ai/gemini";
import { streamChat, type ChatMessage } from "@/lib/ai/chat";
import { combineKnowledgeZh } from "@/lib/ai/knowledge";
import { getSettings } from "@/lib/settings";
import { checkRateLimit } from "@/lib/ratelimit";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MESSAGE_CHARS = 1000; // 單則訊息長度上限
const MAX_TURNS = 20; // 單輪對話(送回的歷史)則數上限

export async function POST(req: Request) {
  if (!isAiEnabled()) {
    return NextResponse.json({ error: "AI 未啟用" }, { status: 503 });
  }

  const settings = await getSettings();
  if (!settings.showChatbot) {
    return NextResponse.json({ error: "聊天功能未開啟" }, { status: 403 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  const rate = await checkRateLimit("chat", ip);
  if (!rate.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { messages?: unknown; lang?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const lang = body.lang === "en" ? "en" : "zh";
  const rawMessages = Array.isArray(body.messages) ? body.messages : [];

  // 清洗:只留 user/model、非空、限長度與則數。
  const messages: ChatMessage[] = rawMessages
    .filter(
      (m): m is { role: string; text: string } =>
        !!m &&
        typeof m === "object" &&
        typeof (m as { text?: unknown }).text === "string" &&
        ((m as { role?: unknown }).role === "user" ||
          (m as { role?: unknown }).role === "model"),
    )
    .slice(-MAX_TURNS)
    .map((m) => ({
      role: m.role === "model" ? "model" : "user",
      text: m.text.slice(0, MAX_MESSAGE_CHARS),
    }));

  if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  // 中文:自動彙整 + 手動補充 合併;英文:單一欄位(維護時已合併譯好)。
  const knowledge =
    lang === "en"
      ? settings.chatbotKnowledgeEn
      : combineKnowledgeZh(settings.chatbotKnowledgeZh, settings.chatbotSupplementZh);

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of streamChat(messages, lang, knowledge)) {
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        // 印出真正的錯誤,供 Vercel Functions log 追查「無法回應」的真兇
        // (逾時 / safety filter / 工具例外 / 金鑰等)。
        console.error("[chat] streamChat failed:", err);
        controller.enqueue(
          encoder.encode(
            lang === "en"
              ? "\n[Sorry, the assistant is temporarily unavailable.]"
              : "\n[抱歉,客服助理暫時無法回應。]",
          ),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
