# 環境變數一覽(交接用)

> 本機開發放 `.env`(範本見 `.env.example`,不進版控)。
> 部署於 **Vercel → Project → Settings → Environment Variables**。
> 建議每個變數的環境都勾 **All Environments**(Production + Preview + Development),
> 否則分支(Preview)部署會因缺變數而 500。改完務必 **Redeploy(不要用 build cache)**。

## 變數清單

| 變數 | 用途 | 取得方式 | 機密 | Vercel 必填 |
|---|---|---|:--:|:--:|
| `DATABASE_URL` | 執行期 DB 連線(Supabase **pooler**,port **6543**,帶 `?pgbouncer=true`) | Supabase → Settings → Database → Connection string | ✅ | ✅ |
| `DIRECT_URL` | migration / `prisma generate` 用的**直連**(port **5432**,不走 pooler) | 同上(換 port) | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_URL` | 前後端連 Supabase Auth/Storage | Supabase → Settings → API | ✅ | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 匿名公開金鑰 | Supabase → Settings → API | ✅ | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | **僅伺服器端**:邀請建帳號、停用封鎖等 admin 操作 | Supabase → Settings → API | ✅ | ✅ |
| `NEXT_PUBLIC_SITE_URL` | 組邀請連結 / OAuth redirect 的站台網址 | 自填:正式填部署網址(**勿用 localhost**) | ➖ | ✅ |
| `RESEND_API_KEY` | 寄信(邀請信、聯絡表單通知);未設定則開發期只印 console、不實寄 | resend.com → API Keys | ✅ | ✅(要寄信) |
| `EMAIL_FROM` | 寄件位址;已採用自有網域 → `光電物理實驗室 <noreply@mail.mjw-opto.com>` | 已驗證網域 `mail.mjw-opto.com` | ➖ | ✅ |
| `CONTACT_RECIPIENTS` | 聯絡表單收件信箱(階段四);**可多個,逗號分隔** | 自填(教授/助教信箱) | ➖ | ✅(要收聯絡信) |
| `SETUP_SECRET` | `/setup` 建立首位最高權限者的密語;建立後該頁自動失效 | 自填一組夠長的隨機字串 | ✅ | 建議 |
| `CRON_SECRET` | 階段五:保護 `/api/cron`(儀器自動簽到/逾時對帳)的 Bearer 密語 | 自填一組夠長的隨機字串 | ✅ | ✅(儀器系統) |
| `GEMINI_API_KEY` | 階段六/七:Blog/Publications「AI 快速新增」+ 聊天機器人(知識庫彙整/翻譯、前台聊天);未設則兩者功能皆隱藏 | Google AI Studio → Get API key | ✅ | 建議(要 AI) |
| `GEMINI_MODEL` | (選填)覆寫 Gemini 模型,預設 `gemini-2.5-flash`;階段六/七共用 | 自填 | ➖ | ➖ |
| `IP_HASH_SECRET` | 訪客 IP 雜湊密鑰(隱私):聊天留存/限流/封鎖只存加密鑰雜湊、不存原始 IP。未設則用不安全開發預設並警告 | 自填一組夠長的隨機字串 | ✅ | ✅(有聊天) |

## 重要提醒(踩過的坑)

- **連線字串密碼一律 URL 編碼**:`@`→`%40`、`/`→`%2F`,否則 Prisma 會把密碼誤判成主機(P1001)。
- **環境變數的值是「部署當下」烤進該次 deployment 的**;改完變數要重新部署舊版才會生效。
- Vercel 環境變數**改成 All Environments**,避免 Preview/分支部署缺變數而 500。
- GitHub Actions 保活排程另有一個 secret `SUPABASE_DB_URL`(用 `DIRECT_URL`),交接時一併移轉。

## Resend(寄信)設定

網站寄信(邀請信、聯絡表單通知)走 Resend,程式在 `src/lib/email.ts`。
**未設 `RESEND_API_KEY` 時,信不會真的寄出,只印到伺服器 console**(開發備援)。

### 取得 API Key(免費)

1. 到 [resend.com](https://resend.com) 註冊登入(免費方案約每月 3,000 封、每天 100 封)。
2. **API Keys → Create API Key** → 命名(如 `mjwebsite`)→ 複製那串 `re_...`(只顯示一次)。
3. 填入本機 `.env` 與 Vercel 的 `RESEND_API_KEY`。

### 寄件網域(已完成 ✅)

> **「寄件網域」與「網站網域」是兩回事**:Resend 驗證的是 email `From:` 用的網域,
> 跟網站掛在 vercel.app 還是自有網域**無關**。`vercel.app` 無法驗證(DNS 不是你的)。

**現況(2026-06-26)**:已購入自有網域 `mjw-opto.com`,並於 Resend 驗證寄件子網域
**`mail.mjw-opto.com`**(DNS 由 Vercel 代管,region Tokyo `ap-northeast-1`;
DKIM / SPF / DMARC 皆通過,狀態 Verified)。正式寄件位址:

```
EMAIL_FROM="光電物理實驗室 <noreply@mail.mjw-opto.com>"
```

即可寄給**任何收件人**(不再受 `onboarding@resend.dev` 只能寄給自己的限制)。

> 交接重點:**Resend 帳號 + `mjw-opto.com` 網域 + Vercel DNS** 最終皆應移轉至教授名下。
> 若日後更換寄件網域,於 Resend → Domains 重新 Add Domain 驗證後改 `EMAIL_FROM` 即可。

## 階段五:儀器對帳排程(GitHub Actions)

儀器「時段一到自動簽到」「逾 3 天標記逾時」由 `.github/workflows/instruments-cron.yml`
每 15 分鐘呼叫一次 `/api/cron`(頁面載入時也會 lazy 對帳,此為備援保證)。
需在 repo → Settings → Secrets and variables → Actions 新增兩個 secret:

- `CRON_SECRET`:與 Vercel 的 `CRON_SECRET` 相同(`/api/cron` 以此驗證 Bearer)。
- `SITE_URL`:部署網址(如 `https://your-site.vercel.app`,結尾不要斜線)。

> GitHub Actions 排程可能延遲數分鐘屬正常;準確性由頁面 lazy 對帳保證。

## 交接時要轉移/重設的東西

- Vercel 上述全部環境變數(含 `CRON_SECRET`)。
- GitHub Actions secret:`SUPABASE_DB_URL`、`CRON_SECRET`、`SITE_URL`。
- 交接前建議在 Supabase 重設一次資料庫密碼與 service role key(若曾外流),並同步更新本機 `.env` 與 Vercel。
