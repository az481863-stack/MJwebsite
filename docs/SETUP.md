# 階段零:帳號與環境設定清單

> 這份清單列出**需要你本人登入操作**的外部帳號設定(我無法代勞)。
> 核心原則(見 CLAUDE.md「帳號歸屬與交接」):三服務最終都歸屬實驗室/吳教授,
> 開發者僅以協作者身份參與。**最省事的順序:先幫教授開好一組 GitHub 帳號,
> Supabase 與 Vercel 都用該 GitHub 登入建立**,教授實質只需記一組登入。

完成每一步後回來打勾。本機程式碼骨架我已建好,只差把這些帳號的連線資訊填進 `.env`。

---

## 0. 先決定:用誰的 email 幫教授開 GitHub
- [ ] 取得吳教授一組可用 email(將成為三服務的擁有者身份)。
- [ ] 以該 email 建立教授的 **GitHub 個人帳號**(`github.com` → Sign up)。
  - 之後 Supabase、Vercel 都選「以 GitHub 登入」,就能串起三者。

---

## 1. GitHub:免費 Organization + repo
- [ ] 建立一個**免費 Organization**(GitHub → 右上 + → New organization → Free 方案)。
  - 命名建議:實驗室英文名,如 `wu-optoelectronics-lab`。
- [ ] 在 Organization **容器內**建立私有 repo(**不要**開在個人帳號底下)。
  - 名稱建議:`lab-website`。
- [ ] 把本機這個專案推上去(我可以幫你跑指令,你只要先把 repo 建好給我網址)。
- [ ] 交付前:把教授帳號加入 Organization 並設為 **owner**,開發者降級/移除。

---

## 2. Supabase:**開在教授名下**(最該謹慎,含真實資料且唯一會付費)
- [ ] 用**教授的 GitHub 帳號**登入 Supabase(`supabase.com` → Sign in with GitHub)。
- [ ] 建立 **Organization**(教授名下)→ 在其下建立專案(Free 方案)。
  - Region 選 **東京 (Northeast Asia / ap-northeast-1)** 或最近的亞洲節點。
  - 設一組強資料庫密碼並記下來。
- [ ] 開發者以**成員身份**受邀進該 Organization 開發。
- [ ] 取得連線資訊填入 `.env`(範本見 `.env.example`):
  - `Project Settings → Database → Connection string` → 取 **Transaction pooler (6543)** 給 `DATABASE_URL`、**Direct (5432)** 給 `DIRECT_URL`。
  - `Project Settings → API` → `NEXT_PUBLIC_SUPABASE_URL`、`anon` key、`service_role` key。
- [ ] 把 **Direct 連線字串**也存成 GitHub repo 的 secret `SUPABASE_DB_URL`(供保活 workflow 用)。

> 為何 Supabase 一開始就開教授名下:內含真實資料,且是唯一未來會升 Pro($25/月)
> 的服務,付款綁誰帳單就寄給誰;組織/計費轉移較痛,越晚搬越麻煩。

---

## 3. Vercel:團隊(Team)底下,連動 GitHub 自動部署
- [ ] 用**教授的 GitHub 帳號**登入 Vercel(`vercel.com` → Continue with GitHub)。
- [ ] 建立一個 **Team**(Free 方案即含團隊功能),專案放團隊底下而非個人名下。
- [ ] Import 第 1 步的 GitHub repo → 自動偵測 Next.js → Deploy。
- [ ] 在 Vercel 專案 `Settings → Environment Variables` 填入與 `.env` 相同的變數
      (`DATABASE_URL`、`DIRECT_URL`、`NEXT_PUBLIC_SUPABASE_URL`、anon/service key)。
- [ ] 交付前:把教授設為 Team 擁有者,開發者退出。

---

## 4. 本機連線驗證(這步我來做,等你 `.env` 填好)
- [ ] `.env` 填入真實 Supabase 連線資訊後,跑 `npx prisma migrate dev` 建立資料表。
- [ ] 確認本機 `npm run dev` 連得上 Supabase。

---

## 階段零測試通過條件對照(CLAUDE.md F-階段零)
- [ ] 最小頁面能經 GitHub → Vercel 自動部署上線。
- [ ] 本機與部署環境皆能連線 Supabase。
- [ ] 三服務帳號歸屬正確(教授名下/容器內),開發者為協作者。
- [ ] 保活排程已啟用並成功執行至少一次(可在 GitHub Actions 頁手動 `Run workflow` 測一次)。
