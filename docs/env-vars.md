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
| `EMAIL_FROM` | 寄件位址;正式須為 Resend 已驗證網域 | 自填(未設用 `onboarding@resend.dev` 測試) | ➖ | 建議 |
| `CONTACT_RECIPIENTS` | 聯絡表單收件信箱(階段四);**可多個,逗號分隔** | 自填(教授/助教信箱) | ➖ | ✅(要收聯絡信) |
| `SETUP_SECRET` | `/setup` 建立首位最高權限者的密語;建立後該頁自動失效 | 自填一組夠長的隨機字串 | ✅ | 建議 |

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

### 寄件網域(重要)

> **「寄件網域」與「網站網域」是兩回事**:Resend 驗證的是 email `From:` 用的網域,
> 跟網站掛在 vercel.app 還是自有網域**無關**。`vercel.app` 無法驗證(DNS 不是你的)。

| 階段 | `EMAIL_FROM` | 可寄給誰 | 要驗證嗎 |
|---|---|---|---|
| 還沒有自有網域(測試) | `onboarding@resend.dev`(預設) | **只能寄到你註冊 Resend 的那個 email** | 否 |
| 已買自有網域(正式) | `noreply@<你的網域>` | 任何人,送達率較佳 | 是 |

**買到自有網域後的驗證步驟**:Resend → **Domains → Add Domain** → 輸入網域 →
依指示到網域 DNS 後台新增 SPF / DKIM(及 DMARC)記錄 → 等驗證通過 →
把 `EMAIL_FROM` 改成該網域的寄件位址。完成後即可寄給任何收件人。

> 交接重點:Resend 帳號與 API Key 最終應開/移轉至**教授名下**。

## 交接時要轉移/重設的東西

- Vercel 上述全部環境變數。
- GitHub Actions secret:`SUPABASE_DB_URL`。
- 交接前建議在 Supabase 重設一次資料庫密碼與 service role key(若曾外流),並同步更新本機 `.env` 與 Vercel。
