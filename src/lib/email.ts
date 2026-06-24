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
  to: string,
  subject: string,
  html: string,
): Promise<SendResult> {
  if (!RESEND_API_KEY) {
    // 開發備援:無金鑰時印出,方便本機測試。
    console.log(
      `\n[email:dev] 未設定 RESEND_API_KEY,以下為應寄出的信件\n  收件:${to}\n  主旨:${subject}\n`,
    );
    return { delivered: false, devLogged: true };
  }
  const resend = new Resend(RESEND_API_KEY);
  await resend.emails.send({ from: EMAIL_FROM, to, subject, html });
  return { delivered: true };
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
