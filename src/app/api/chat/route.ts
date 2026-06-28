// 階段七:聊天機器人 API。POST { messages, lang } → 串流回傳文字。
// 護欄/知識庫見 src/lib/ai/chat.ts;知識來源為 Settings 的中/英知識庫(維護時譯好)。
// 防濫用:每 IP 記憶體速率限制 + 單則長度上限 + 單輪則數上限。
// (記憶體限流在 serverless 多實例下非全域共享,屬「基本防灌」,沿用階段四思路。)

import { NextResponse } from "next/server";
import { isAiEnabled } from "@/lib/ai/gemini";
import { streamChat, type ChatMessage } from "@/lib/ai/chat";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MESSAGE_CHARS = 1000; // 單則訊息長度上限
const MAX_TURNS = 20; // 單輪對話(送回的歷史)則數上限
const RATE_WINDOW_MS = 10 * 60 * 1000; // 10 分鐘
const RATE_MAX = 30; // 每 IP 每視窗最多 30 次

const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const arr = (hits.get(ip) ?? []).filter((t) => now - t < RATE_WINDOW_MS);
  if (arr.length >= RATE_MAX) {
    hits.set(ip, arr);
    return true;
  }
  arr.push(now);
  hits.set(ip, arr);
  return false;
}

export async function POST(req: Request) {
  if (!isAiEnabled()) {
    return NextResponse.json({ error: "AI 未啟用" }, { status: 503 });
  }

  const settings = await getSettings();
  if (!settings.showChatbot) {
    return NextResponse.json({ error: "聊天功能未開啟" }, { status: 403 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
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

  const knowledge =
    lang === "en" ? settings.chatbotKnowledgeEn : settings.chatbotKnowledgeZh;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of streamChat(messages, lang, knowledge)) {
          controller.enqueue(encoder.encode(delta));
        }
      } catch {
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
