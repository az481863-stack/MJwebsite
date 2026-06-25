// 郵件寄送模組(獨立封裝,與主流程隔離,便於日後換供應商)。
// - 設定 RESEND_API_KEY 時走 Resend 實寄。
// - 未設定時(開發期)自動把連結印到 console,不阻斷流程。

import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;
// 正式寄出需用已驗證網域;未設定時用 Resend 測試寄件位址。
const EMAIL_FROM =
  process.env.EMAIL_FROM ?? "光電物理實驗室 <onboarding@resend.dev>";

export interface SendResult {
  delivered: boolean;
  devLogged?: boolean;
}

async function send(
  to: string | string[],
  subject: string,
  html: string,
  replyTo?: string,
): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    // 開發備援:無金鑰時印出,方便本機測試。
    console.log(
      `\n[email:dev] 未設定 RESEND_API_KEY,以下為應寄出的信件\n  收件:${[to].flat().join(", ")}\n  主旨:${subject}\n`,
    );
    return { delivered: false, devLogged: true };
  }
  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });
  return { delivered: true };
}

// 聯絡表單分類標籤(寄給教授的信以中文呈現)。
const CONTACT_CATEGORY_LABEL: Record<string, string> = {
  industry: "產學合作洽詢",
  academic: "學術同行交流",
  recruit: "學生·博士後應徵面談",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 聯絡表單通知信(階段四):依分類寄給收件信箱,可直接回覆給填表人。
export async function sendContactEmail(opts: {
  recipients: string[];
  category: string;
  name: string;
  email: string;
  message: string;
}): Promise<SendResult> {
  const catLabel = CONTACT_CATEGORY_LABEL[opts.category] ?? opts.category;
  const subject = `[聯絡表單·${catLabel}] 來自 ${opts.name}`;
  const html = `
    <div style="font-family: -apple-system, 'Noto Sans TC', Arial, sans-serif; line-height:1.7; color:#111; max-width:560px;">
      <h2 style="font-weight:600;">網站聯絡表單新訊息</h2>
      <table style="border-collapse:collapse; font-size:15px;">
        <tr><td style="color:#6b6b6b; padding:4px 16px 4px 0;">分類</td><td><strong>${escapeHtml(catLabel)}</strong></td></tr>
        <tr><td style="color:#6b6b6b; padding:4px 16px 4px 0;">姓名</td><td>${escapeHtml(opts.name)}</td></tr>
        <tr><td style="color:#6b6b6b; padding:4px 16px 4px 0;">Email</td><td><a href="mailto:${escapeHtml(opts.email)}">${escapeHtml(opts.email)}</a></td></tr>
      </table>
      <p style="margin-top:18px; color:#6b6b6b;">訊息內容:</p>
      <p style="white-space:pre-wrap; border-left:2px solid #111; padding-left:14px;">${escapeHtml(opts.message)}</p>
      <p style="color:#6b6b6b;font-size:13px;margin-top:24px;">可直接回覆此信與對方聯繫。</p>
    </div>
  `;
  return send(opts.recipients, subject, html, opts.email);
}

// 邀請信:含啟用連結(C-1)。
export async function sendInvitationEmail(opts: {
  to: string;
  inviteUrl: string;
}): Promise<SendResult> {
  const subject = "邀請您加入光電物理實驗室";
  const html = `
    <div style="font-family: -apple-system, 'Noto Sans TC', Arial, sans-serif; line-height:1.7; color:#111; max-width:520px;">
      <h2 style="font-weight:600;">光電物理實驗室 邀請通知</h2>
      <p>您好,您受邀加入光電物理實驗室網站。請點擊下方連結設定登入密碼以啟用帳號:</p>
      <p style="margin:28px 0;">
        <a href="${opts.inviteUrl}"
           style="background:#111;color:#fff;text-decoration:none;padding:12px 22px;border-radius:4px;display:inline-block;">
          設定密碼並啟用帳號
        </a>
      </p>
      <p style="color:#6b6b6b;font-size:14px;">此連結 7 天內有效,啟用後即失效。若您並未預期收到此信,請忽略即可。</p>
      <p style="color:#6b6b6b;font-size:14px;word-break:break-all;">若按鈕無法點擊,請複製此網址:<br>${opts.inviteUrl}</p>
    </div>
  `;
  if (!RESEND_API_KEY) {
    // 開發備援:把實際連結印出(send() 不印連結,這裡補上)。
    console.log(`[email:dev] 邀請連結 → ${opts.to}\n  ${opts.inviteUrl}\n`);
  }
  return send(opts.to, subject, html);
}
