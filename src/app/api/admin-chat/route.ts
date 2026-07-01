// 後台「管理員小幫手」API。POST { messages } → 串流回傳文字(繁體中文)。
// 與前台 /api/chat 分開:僅限已登入的 ADMIN 使用;知識來源為 SiteSettings.adminGuide(使用說明頁)。
// 防濫用:每 IP 記憶體速率限制 + 單則長度上限 + 單輪則數上限(沿用 /api/chat 思路)。

import { NextResponse } from "next/server";
import { getCurrentMember, roleAtLeast } from "@/lib/auth";
import { isAiEnabled } from "@/lib/ai/gemini";
import { streamAdminChat, type ChatMessage } from "@/lib/ai/chat";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const MAX_MESSAGE_CHARS = 1000;
const MAX_TURNS = 20;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const RATE_MAX = 30;

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
  // 僅限已登入的 ADMIN(管理員小幫手為後台專用)。
  const me = await getCurrentMember();
  if (!me || !roleAtLeast(me.role, "ADMIN")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 403 });
  }

  if (!isAiEnabled()) {
    return NextResponse.json({ error: "AI 未啟用" }, { status: 503 });
  }

  const ip = (req.headers.get("x-forwarded-for") ?? "unknown").split(",")[0].trim();
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: { messages?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const rawMessages = Array.isArray(body.messages) ? body.messages : [];
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

  const settings = await getSettings();
  const guide = settings.adminGuide;

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const delta of streamAdminChat(messages, guide)) {
          controller.enqueue(encoder.encode(delta));
        }
      } catch (err) {
        console.error("[admin-chat] streamAdminChat failed:", err);
        controller.enqueue(encoder.encode("\n[抱歉,管理員小幫手暫時無法回應。]"));
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
