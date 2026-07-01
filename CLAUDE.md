# CLAUDE.md — 光電物理實驗室網站 專案規格

> 本文件為專案的單一事實來源(source of truth)。
> 分階段以**測試關卡**為主軸:每個階段需通過該階段「測試通過條件」後,方可進入下一階段。
> 註:原始需求稿提及的 Notion 串接已確定**不採用**,改為自建後台。全文不再援引 Notion。

> **【階段完成時的更新規則】**(每個階段通過測試後必做)
> 1. 於文末「開發日誌」對應階段填寫:實際與規格的偏差、遇到的問題與解決方案、衍生的新待辦/技術債、給後續階段的提醒。
> 2. **若某解法永久改變了後續做法,除了記入日誌,必須回頭修改對應的規格段落**,使規格永遠反映「現在的真相」。日誌記「為什麼變」,規格記「現在是什麼」。
> 3. 此舉讓後續開發(含 Claude Code)讀到既有的踩坑經驗,避免重蹈覆轍。

---

## 技術架構與部署(Tech Stack & Deployment)

> 開發模式:由單一開發者主導,大量借助 Claude Code 輔助。選型原則=主流、整合度高、文件豐富、AI 熟悉,避免冷僻技術。規模小(使用者 < 百人),不採用任何為高流量設計的複雜架構。

### 選型
- **前端 / 全端框架**:Next.js(React)。前後端一把抓,單人開發省力;與 Tiptap 天然契合。
- **資料庫**:PostgreSQL(由 Supabase 提供)。全站資料皆為關聯式(會員↔內容、儀器↔預約↔簽退、負責人↔儀器多對多),用關聯式資料庫最穩。
- **ORM**:Prisma。以清楚的 schema 定義資料表,生成型別安全存取碼;集中管理軟刪除、created_by 等共用欄位,並讓 Claude Code 有明確的資料地圖。
- **後端平台**:Supabase(Postgres + Auth + Storage 一站式)。
  - **Auth**:直接用 Supabase 內建驗證(email 密碼、Google 登入、邀請使用者),覆蓋 B/C 段的會員與邀請需求。不另接 Auth.js / Clerk,除非邀請流程有卡。
  - **Storage**:成員照片、儀器照片、講義下載等檔案。**上傳前須壓縮圖片**,以守住免費層 1GB 檔案空間並加快載入。
- **富文本編輯器**:Tiptap(用於 Blog 與 Publications 內文)。AI 預填(階段六)須寫入 Tiptap 格式。
- **AI 串接(階段六)**:Google **Gemini** API(教授慣用)。AI 程式碼包成獨立模組與主流程隔離,便於日後換模型;呼應「AI 為加分項非地基」原則。

### 部署
- 程式碼置於 **GitHub** → **Vercel** 連動自動部署 Next.js(Next.js 原廠平台,零摩擦)。
- Supabase 為獨立託管服務,Next.js 後端透過連線存取(資料層 + Auth + Storage)。
- **需管理的帳號**:Vercel、Supabase(GitHub 為程式碼托管)。詳見下方「帳號歸屬與交接」。
- **Vercel 函式區域須與 Supabase DB 同區**:目前兩者皆在**新加坡**(Vercel `sin1` / Supabase `ap-southeast-1`)。前台多為 `force-dynamic`(每次請求多筆 DB 查詢),函式與 DB 同區可把最貴的「函式↔DB」往返壓到最低。區域寫在根目錄 `vercel.json` 的 `regions`(以檔案為準、交接時跟著走)。**日後若搬 DB 區域,務必同步改 `vercel.json` 的函式區域**(沿革見開發日誌「部署效能後記」)。

### 排程(時間驅動任務)
- 需求:儀器「時段一到自動簽到」「逾 3 天關閉簽退」等任務需定時執行。
- 實作:優先用 **Supabase pg_cron**(任務本質為資料庫狀態變更,放資料庫層最自然),或 GitHub Actions / Vercel Cron 定時觸發。

### 方案層級與升級時機(成本)
- **起步:Supabase 免費層**。已知並接受其限制:7 天無資料庫活動會暫停;**無自動備份**(吳教授已知並接受無備份風險)。
- 使用量評估(規模:學生 ≤ 15、儀器 15~20、訪客極少):資料庫 500MB、檔案 1GB、流量 5GB/月、5 萬 MAU 等額度**遠超所需**,用量不會是瓶頸。唯一需留意:圖片壓縮以守 1GB。
- **升級 Pro($25/月)時機**:當需要「保證不暫停」或「自動備份」或觸及任一用量上限時。升級理由是穩定性與備份,非用量。
- **免費層保活**:開發期可用 GitHub Actions 每 3 天自動對資料庫發無害查詢(如 `select now();`)防暫停;**須為自動排程,不可靠人手按鈕**(會遺忘)。上線後業務排程本身即持續產生資料庫活動,暫停問題自然消失。

### 備份(可選,非第一階段必做)
- 因接受無備份風險,官方備份(Pro)暫不採用。
- **備案**:可用 GitHub Actions 每日 `pg_dump` 匯出資料庫 → 上傳 **Google Drive**(透過 Google Drive API / service account 憑證),並定期清理舊檔(如僅留近 30 份)。零成本、免升 Pro。**標記為日後可選增強,非必做。**

### 帳號歸屬與交接(接案重點)
> 三服務(GitHub、Vercel、Supabase)最終皆應歸屬實驗室/吳教授,開發者僅以協作者身份參與,交付時退出即完成交接。教授不熟操作,多由開發者代為設置;**「擁有權登記在教授名下」與「教授會不會操作」是兩回事**,教授只需提供 email、知悉自己為擁有者、升 Pro 時提供付款方式即可。

- **GitHub**:開一個**免費 Organization**(Organization 不收費,免費方案即含無限私有 repo)。
  - 開發期可由**開發者帳號**建立 Organization 並起步;**repo 須開在 Organization 容器內,而非開發者個人 repo 底下**。
  - 交付前:幫教授開個人 GitHub 帳號 → 加入 Organization 並設為 owner → 開發者降級或移除。因東西已在 Organization 內,僅「換 owner」,不需搬 repo、不斷 Vercel/Actions 連動。
- **Vercel**:比照 GitHub。建一個**團隊(Team)**,專案放團隊底下而非個人名下;交付前將教授設為擁有者、開發者退出。免費方案即含團隊功能。
- **Supabase**:**最該謹慎,建議一開始就開在教授名下**。原因:(1) 內含真實資料(會員、預約紀錄),(2) 是唯一未來會付費的服務(升 Pro $25/月),付款方式綁誰、帳單就寄給誰。其組織/計費轉移較不隨手,越晚搬越痛。
  - 理想:用教授 email 開 Supabase 帳號 → 建 Organization → 專案開其下 → 開發者以成員身份受邀開發。
  - 若先用開發者帳號起步,**務必趁免費層、資料量小時盡早轉移**。
- **省事技巧**:三服務皆支援「以 GitHub 登入」。建議先幫教授開好 **GitHub 個人帳號**,再讓 Vercel、Supabase 都用其 GitHub 登入建立 → 教授實質只需記一組 GitHub 登入即可串起三者。
- **建議執行順序**:一次幫教授開好 GitHub 帳號 → Supabase(必要,開教授名下)與 Vercel(順便)皆以其 GitHub 登入建立 → 開發者全程當協作者。前期多花少許工,換取三服務從頭歸屬正確、交付時僅需退出。

---

## A. 全站規格(跨階段)

### A-1. 視覺與技術
- 視覺風格:**Dark Optics(暗色光學學院風)**。**以淺色學院風為底**(白底、大氣黑字、大量留白),搭配**戲劇性的近黑深色帶**(首頁 Hero、「主持人理念」帶)與**雷射光路幾何**(動態光束)。**非全站全黑**——深色僅用於指定區塊(`.band-dark` + Hero),其餘維持淺色。**重點色(`--accent`)由後台 Settings 的 `siteAccent` 決定**,用於 Hero 光束、重點數字/標籤、主要按鈕等;可選色票見 `src/lib/accent.ts`(預設「青」`#22d3ee`)。
  - 〔原規格為「極簡學院風:純白底、大氣黑字」;吳教授檢視後認為過白單調,參考 awwwards 後拍板改為 Dark Optics(淺底 + 深色 Hero 帶 + 可調重點色),並保留調色盤於後台。規格已更新為現狀,沿革見開發日誌階段三後記。〕
  - 技術實作:沿用語意化 CSS tokens(`--background`/`--foreground`/`--muted`/`--line`),`:root` 維持淺色;深色帶以 `.band-dark` class 局部反轉 token(近黑底白字)。`--accent` 由 `layout.tsx` 依設定 server-side 注入 `<html>`(無閃爍)。後台(admin/login/account/setup)維持原淺色介面。
- 語言:全站右上角固定 [EN / 中文] 切換鈕。**全站(含首頁核心標題與教授簡介)顯示單一語言,隨切換鈕變換,不並列雙語。** 內頁以中文為主、同樣支援切換。
  - **動態內容雙語機制(adjustment 輪)**:各後台內容類型(動態佈告欄、儀器說明、職缺、Blog 等)除中文外另存**英文欄位**,維護時於編輯頁按「**一鍵翻譯成英文**」(Gemini)產生、可手改後存檔;前台切 EN 取英文欄,**英文留空則 fallback 顯示中文**(部分翻譯不開天窗)。採「維護時翻好存 DB」而非前台即時翻譯(省 token、可校稿、AI 掛了英文站照常),與階段七知識庫同原則。共用程式:`src/lib/ai/gemini.ts` 的 `translateFieldsToEnglish`、`src/app/admin/translate-action.ts`、`src/components/admin/TranslateButton.tsx`。沿革見開發日誌。
- 後台:自建 CMS,前台內容由後台維護,無需改原始碼。**前台主題重點色亦於後台 Settings 調整(調色盤),不需改原始碼。**

### A-2. 導覽列
首頁 Home｜研究與產學 Research & Industry｜團隊與招募 Lab Team｜儀器預約管理 Instruments｜光電小講堂 Blog｜聯絡教授 Contact
- 置頂,滾動固定或隱藏。**首頁的 navbar 為淺色**(疊在深色 Hero 上);**其餘前台內頁的 navbar 為深色帶雷射光束**(`.band-dark` + accent);後台(admin/login/account/setup/invite)維持淺色。判斷見 `src/components/Navbar.tsx` 的 `dark` 變數。
- 每頁主色呈現:`Section` 標題上方的 accent 短條(`src/components/ui/Section.tsx`)+ 內頁深色 navbar 的雷射光束與 active 連結,使全站每頁皆可見當前重點色。
- 「儀器預約管理」入口於儀器系統(階段五)上線前可先隱藏或導向「即將推出」。

---

## B. 使用者與權限(跨階段,階段二實作)

三層角色,權限**往上累加**(上層含下層全部能力)。

| 層級 | 身份 | 能力 |
|---|---|---|
| 第一層 | **最高權限者**(教授/大助教) | 管理員全部能力 + **唯一能**:修改其他會員權限、移除會員、邀請時指定角色 |
| 第二層 | **管理員**(助教) | 內容增刪改、**發布**、**審核草稿**、軟刪除;儀器管理頁;邀請會員(但一律為學生) |
| 第三層 | **學生**(= 投稿者) | 建內容草稿(Blog/論文)、上傳 Word 生草稿(不可發布);使用儀器預約頁 |

### 關鍵規則
- **邀請指定角色**:僅最高權限者可於邀請時指定對方為「學生或管理員」;管理員邀請的人**一律為學生**。
- **最高權限者**不從邀請產生,由現任最高權限者事後手動升級。
- **防呆**:不可刪除或降級「最後一位最高權限者」。
- **審核權**:學生草稿(含論文、Blog)由「管理員以上」審核發布。(已定案,不需教授親審。)
- **無永久刪除**:刪除一律為軟刪除/停用;管理員以上可檢視已刪除、可還原。

### B-2. 儀器層級的負責人權限(獨立於三層角色)
除三層全站角色外,另有一個「儀器層級」的權限維度:任一會員可被指派為「特定某幾台儀器的負責人」。
- 負責人對**自己負責的儀器**:可檢視/管理(看使用·預約·簽退·異常狀況、改機況狀態、**代學生簽退**),並收異常警報信。
- 對**非自己負責的儀器**:權限同其全站角色(學生即只能預約)。
- 資料模型:為「會員 ─ 負責 ─ 儀器」的多對多關聯,而非新增第四種全站角色。
- 最高權限者可直接預約儀器(既能管理、也能如學生般約用)。

---

## C. 會員系統(階段二實作)

### C-1. 邀請會員制(僅受邀者可成為會員)
1. **新增邀請**:最高權限者/管理員輸入受邀人 email(最高權限者可選角色;管理員固定為學生)→ 系統**直接建立一筆會員**,狀態 = 未啟用,並寄出含專屬邀請連結的信。
2. **啟用**:受邀人點連結 → 設定登入密碼 → 狀態轉為 已啟用 → 詢問是否連結 Google 帳號(之後可用 Google 登入;略過則純密碼登入)。

### C-2. 會員狀態
- `未啟用 (Pending)`:已建立、未設密碼,不能登入。
- `已啟用 (Active)`:正常使用。
- `已停用 (Disabled)`:停止登入但保留歷史資料(畢業/離開時用,取代「刪除」)。

### C-3. 邀請連結安全規則(工程實作要求)
- 連結帶隨機 token、設有效期(建議 7 天),過期失效。
- 啟用後該連結即作廢,不可重用。
- 支援「重寄邀請」:重發新連結,舊連結失效。
- 密碼須加密儲存(使用標準雜湊,勿自製)。
- Google 登入與既有密碼帳號若為同一 email,須辨識為同一會員,避免重複帳號。

### C-4. 會員資料欄位

**第一階段啟用(info 頁可操作)**
| 欄位 | 型態 | 說明 |
|---|---|---|
| 登入 email | email | 主要識別 |
| 密碼 | 加密 | 可更改 |
| Google 連結 | 關聯 | 可連結/解除 |
| 常用 email | **一對多** | 可新增多筆(資料層為「會員 1 ─ N email」,非單欄) |
| 角色 | 狀態 | 學生/管理員/最高權限者 |
| 帳號狀態 | 狀態 | 未啟用/已啟用/已停用 |

**預留欄位(資料庫先留、前台暫不做)**:照片、暱稱、生日……等個人資料,屆時於會員表補上即可,零結構成本。

### C-5. 會員 info 頁(第一階段功能)
更改密碼、連結/解除 Google、管理常用 email(多筆)。

---

## D. 共用系統欄位(所有資料表通用)

| 欄位 | 用途 |
|---|---|
| `created_at` | 建立時間(多數框架自動;兼作前台倒序排序依據) |
| `updated_at` | 最後更新時間(自動) |
| `created_by` | 建立者會員 ID |
| `updated_by` | 最後更新者會員 ID |
| `deleted_at` | 軟刪除標記(非 NULL 即視為已刪除,前台不顯示) |
| `deleted_by` | 執行刪除者會員 ID |

- 每個會員擁有**穩定不變的主鍵 ID**,供現在與未來所有模組關聯引用。
- **無永久刪除**機制。

---

## E. 未來模組(不在現排程,僅預留地基)

討論區、聊天室、站內信等,屬**獨立功能模組**,各需自己的資料表(貼文/訊息/信件等),屆時各自建表並以**關聯指向會員 ID**。
- 現在**不預建**這些表(預建=做半套,需求一變即白做)。
- 真正要預留的是「會員可被未來模組引用」的地基,即 D 的穩定會員 ID——做正規會員系統本就具備。

---

# F. 分階段交付計畫(以測試關卡為主軸)

> 規則:每階段須通過「測試通過條件」方可進入下一階段。
> 順序:階段零(地基)→ 一~六(功能)→ 交付與交接(結案)。
> 依賴關係:所有功能階段依賴階段零;三 依賴 二;五 依賴 二;六 依賴 三;七 依賴 三(Settings 知識庫)並與六共用 Gemini。

---

## 階段零:環境與帳號建置(開工前地基)
**範圍**:所有「動工前必須就位」的帳號、服務與環境設定。對應「技術架構與部署」段的決策落地為實際動作。
- **帳號歸屬**:依「帳號歸屬與交接」執行——建議一次幫教授開好 GitHub 帳號,Supabase(開教授名下)與 Vercel 皆以其 GitHub 登入建立,開發者全程當協作者。(若 GitHub/Vercel 先用開發者帳號起步,須確保 repo 開在 Organization/Team 容器內,非個人 repo 底下。)
- **GitHub**:建立免費 Organization 與專案 repo。
- **Supabase**:建立專案(免費層),取得連線資訊;規劃資料表 schema(Prisma)。
- **Vercel**:連動 GitHub repo,設定自動部署。
- **本機開發環境**:Next.js 專案初始化,跑得起來、連得上 Supabase。
- **保活排程**:設定 GitHub Actions 每 3 天自動查詢資料庫防暫停(自動,非人手)。

**測試通過條件**
- [ ] 一個最小頁面(hello world)能成功經 GitHub → Vercel 自動部署上線。
- [ ] 本機與部署環境皆能成功連線 Supabase。
- [ ] 三服務帳號歸屬正確(理想為教授名下/容器內),開發者為協作者。
- [ ] 保活排程已啟用並成功執行至少一次。

---

## 階段一:靜態內容網站(前台骨架 + 寫死頁面)
**範圍**:建立視覺框架與所有「寫死」內容,不需後台。
- 全站版型、導覽列、頁尾、語系切換。
- 首頁 Hero(標題與簡介隨語系切換顯示單一語言、背景圖、CTA 按鈕)。
- 寫死區塊:研究領域、PI 理念、應徵範本(複製按鈕)、聯絡基本資訊。
- 各動態區塊先以**靜態假資料**佔位(驗證版型)。

**測試通過條件**
- [ ] 所有頁面正確渲染,RWD 在手機/桌機皆正常。
- [ ] 語系切換全站正確,顯示單一語言、不並列雙語。
- [ ] 導覽列置頂/隱藏行為正常,連結皆可達。
- [ ] 「複製應徵範本」按鈕可正確複製定型文字。

---

## 階段二:會員與權限系統(後台地基)
**範圍**:三層角色、邀請啟用流程、登入、會員 info 頁、軟刪除。(對應 B、C、D)
- 邀請→建未啟用會員→寄信→點連結設密碼→啟用→詢問綁 Google。
- 登入(密碼 / Google)、會員 info 頁(改密碼、綁 Google、多筆常用 email)。
- 角色權限控制、會員停用(軟刪除)。
- **首位最高權限者建立**(B:不從邀請產生):提供 `/setup` 一次性網頁(需 `SETUP_SECRET` 密語,且系統尚無最高權限者時才作用,建立後自動失效)與 `npm run seed:superadmin` 終端機腳本兩種方式。

**測試通過條件**
- [x] 邀請流程全程可走通;邀請連結過期/重用/重寄行為正確。
- [x] 最高權限者邀請可選角色;管理員邀請固定為學生。
- [x] 三層權限正確隔離(學生不能發布/管帳號;管理員不能管帳號)。
- [x] 「最後一位最高權限者」無法被刪除或降級。
- [x] 密碼加密儲存(交給 Supabase Auth)。〔Google 與同 email 辨識同一人:實作完成,待 Supabase 啟用 Google provider 後端到端驗證。〕
- [x] 停用會員無法登入但歷史資料保留。

---

## 階段三:內容後台 CMS(動態區塊,表單手填)
**範圍**:各「動態」區塊的後台 CRUD,純表單手填(**尚無 AI**),含草稿/審核流程與軟刪除。對應區塊欄位見 **附錄 G**。
- 動態佈告欄、Publications、現役成員、校友、職缺管理、Blog、課程紀錄、**產學與專利**、**給高中生的話**。
- **Blog 內文**採用 **Tiptap**(富文本編輯器,中英雙版)。**Publications 為結構化欄位**(作者/標題/期刊/年份/DOI/精選),無內文 body,故不使用 Tiptap(原規格「Blog 與 Publications 採 Tiptap」已依實作修正:Publications 無 body 可富文本化)。
- 學生建草稿 → 管理員以上審核發布。
- **設定頁(Settings)**:管理頁面層級的雜項與**通用「顯示/隱藏」開關**——任一頁面(如產學與專利、給高中生的話,乃至未上線的儀器頁)皆可由開關控制是否於前台顯示。亦含**儀器預約總時數上限**(預設 24 小時,供階段五使用)等全站參數。
  - 〔adjustment 輪追加:Settings 另含**首頁文字**(Hero 標題/副標、PI 理念、研究領域標題/引言/卡片)與**聯絡資訊**(名稱/地址/Email/電話/辦公時間)的可編輯欄位,中英分填、留空 fallback 字典。沿革見開發日誌。〕

**測試通過條件**
- [x] 每種內容皆可新增/編輯/軟刪除,前台正確呈現(含倒序排序、精選加粗)。
- [x] Blog 之 Tiptap 編輯器存取與渲染正確(含圖片、表格、上下標、LaTeX 公式)。〔Publications 改為結構化欄位,見上方說明〕
- [x] 草稿/審核流程正確:學生送草稿、管理員以上才能發布。
- [x] 權限正確:學生看不到他人草稿(只見自己),無發布/刪除權;軟刪除後前台即不顯示。
- [x] 職缺可新增/刪除整筆,狀態(開放/額滿)前台正確反映。
- [x] Settings 的頁面顯示/隱藏開關對前台與導覽生效(隱藏頁直接造訪 404)。

---

## 階段四:聯絡表單與分類寄信
**範圍**:聯絡頁表單 + 後端分類寄信。
- 下拉強制分類:產學合作洽詢 / 學術同行交流 / 學生·博士後應徵面談。
- 提交後依分類自動寄通知至教授信箱(或對應信箱)。

**測試通過條件**
- [x] 表單驗證正確(必填、email 格式)。〔client `required` + server 端再驗證〕
- [x] 三種分類皆能正確觸發對應寄信,內容完整。〔收件信箱由 `CONTACT_RECIPIENTS`(可多個)決定;實寄需 `RESEND_API_KEY`,未設定時開發期印至 console〕
- [x] 防濫用機制(基本防灌)生效。〔蜜罐隱藏欄位 + 每 IP 記憶體速率限制(10 分鐘最多 3 次)〕

---

## 階段五:儀器預約管理系統
**範圍**:同一份儀器資料、兩種視角。對應欄位見 **附錄 H**。
- **儀器管理頁(管理員以上 + 該機負責人)**:新增/編輯儀器(名稱、用途、負責人 email、照片、狀態),綜覽各台使用/預約/簽退/異常狀況。負責人僅見/管自己負責的機台(見 B-2)。
- **儀器預約頁(學生)**:僅見各台可預約之空檔並預約,看不到管理資訊。最高權限者亦可直接預約。
- **使用紀錄狀態**:預約 → 時段開始前可「提前取消」(開始前隨時可取消);若未取消,**使用時段一到即自動簽到**,該筆轉為「使用中(未簽退)」,**即產生簽退義務(即使未到場使用亦須簽退)**。
- **QR Code 簽退流程**:掃機台 QR → 要求登入 → 系統查找該使用者在該機「使用中·未簽退」之紀錄 → 有則帶往簽退表單;無則顯示「無需簽退」。
- **簽退表單**:確認時數 + 強制機況回報(🟢正常 / 🟡異音不穩 / 🔴故障),**無拍照**。
- **異常自動警報**:勾選 🟡 或 🔴 送出時,立即寄特急 Email 給教授與該台負責人,含異常描述。

#### 維運(本階段牽涉正式上線穩定性)
- **升級 Supabase Pro 判斷點**:儀器系統有定時排程且需隨時可用,為正式營運要件。上線前評估是否升 Pro($25/月)以「保證不暫停 + 取得自動備份」。若維持免費層,須確認保活排程穩定運行(且業務排程本身已產生活動)。決策與付款歸屬依「帳號歸屬與交接」(付款綁教授/實驗室)。

#### 簽退義務與罰則
- **簽退時限**:使用時段結束後 **3 天內**須完成簽退;逾期系統不再開放本人簽退,該筆永久標記為「逾時未簽退」。
- **停權罰則**:當一會員「當前有效的逾時未簽退」達 **3 筆**,即停止其**預約儀器**之權利。(停權僅擋預約,不影響登入、簽退與網站其他功能。)
- **代簽豁免**:該機**負責人**或**管理員以上**可透過系統(其可見該機預約與簽退紀錄)**代為簽退**。
  - 代簽即消化該「逾時未簽退」筆數;有效未簽退數降回 3 筆以下時,**自動恢復**預約權。
  - **非本人簽退一律標記為「代簽」結案**,機況一律**預設正常、不觸發異常警報**。
  - 若事後發現機器異常,由負責人/管理員另行於儀器管理頁直接調整該儀器狀態(與簽退脫鉤)。
- **預約總時數上限**:單一會員「**未來預約**」時數加總不得超過上限(**預設 24 小時,管理員於 Settings 可調**,全站單一數值)。
  - 正常簽退後該筆釋放額度;**「逾時未簽退」不返還額度**,額度持續佔住,直到被(代)簽退為止。

**已定規則(原待答,均已定案)**
- 提前取消:時段開始前隨時可取消。
- 自動簽到後未到場仍須簽退;逾時 3 天不再開放本人簽退。
- QR 簽退為手機網頁表單,非原生 App。

**測試通過條件**(實作 + build/lint/typecheck 通過;端到端人工點測由開發者進行中)
- [x] 預約時段衝突正確阻擋,學生僅能操作自己的預約;最高權限者可預約。〔`hasOverlap` + 整點/過期/額度檢查,皆於 server action 再驗〕
- [x] 提前取消正常;未取消者於時段開始自動簽到、轉「使用中·未簽退」並產生簽退義務。〔`reconcile()`:cron 每 15 分 + 頁面載入 lazy 對帳〕
- [x] QR 掃碼登入後正確帶出該人該機未簽退紀錄;無則顯示「無需簽退」。〔未登入導 `/login?next=…`,login 已支援 next〕
- [x] 逾 3 天不再開放本人簽退;有效逾時未簽退達 3 筆即停止預約權(但仍可登入/簽退)。
- [x] 負責人/管理員代簽正確標記「代簽」、機況預設正常不發警報;代簽後額度與停權正確恢復(衍生計算,自動)。
- [x] 未來預約時數加總超過 Settings 上限時正確阻擋;逾時未簽退不返還額度。〔額度=BOOKED/IN_USE/OVERDUE 加總〕
- [x] 兩種視角權限正確:學生看不到管理資訊;負責人僅能管自己負責的機台。〔負責人即使是學生亦可進管理頁,僅見自己機台〕
- [x] 機況回報強制填寫;勾選 🟡/🔴 即時寄警報給教授與負責人,描述完整。〔實寄需 `RESEND_API_KEY`+驗證網域,未設則 console〕
- [x] 前台狀態燈號與簽退回報連動正確。〔機台狀態(🟢/🟡)手動調整、與簽退脫鉤;最新機況回報於管理頁綜覽呈現〕

---

## 階段六:AI 輔助後台(Word 快速新增)
**範圍**:在 Blog 與 Publications 表單旁加「快速新增」按鈕,上傳 Word 由 AI 預填同一張表單,**走待審草稿,送出前必經人工審核**。
- **Publications**:AI 任務為「正確抽取」(作者/標題/期刊/年份/DOI),不可改寫。
- **Blog**:AI 任務為「重寫整理 + 產出中英兩版」。
- AI 預填的內文須寫入 Tiptap 編輯器格式,與階段三的編輯器一致。
- 餵檔慣例:論文每次只給「新增那幾筆」的 Word,非整份清單。

**測試通過條件**(實作 + build/lint/typecheck 通過;需有效 `GEMINI_API_KEY` 之端到端人工點測由開發者進行)
- [x] 上傳 Word 後,內容正確預填回對應表單欄位。〔建 DRAFT → 導既有編輯頁,表單即帶入 AI 結果〕
- [x] 預填結果僅為草稿,未經審核不會發布。〔ai-actions 一律 `status:"DRAFT"`,前台只顯示 PUBLISHED〕
- [x] Publications 抽取準確(重點驗:作者順序、期刊、年份)。〔`extractPublication` structured output + 提示「只抽取不改寫、保持作者順序」〕
- [x] Blog 中英兩版皆生成,審核者可修改後發布。〔`rewriteBlog` 產 HTML 中英兩版 → `generateJSON` 轉 Tiptap → 編輯頁可改〕
- [x] AI 失效/關閉時,手填流程不受影響(AI 為加分項非地基)。〔未設 `GEMINI_API_KEY` 時 `isAiEnabled()` 為 false,列表頁不渲染入口;手填「新增」照常〕

---

## 階段七:AI 聊天機器人(FAQ / 網站導覽)
**範圍**:於前台加一個浮動聊天視窗,由 Gemini 回答「關於本實驗室與本網站」的問題(研究方向、如何應徵、儀器預約如何運作、聯絡方式、某頁面在哪等)。**定位為導覽/客服:不查即時 DB、不代操作、不寫入任何資料。** 沿用階段六既有的 Gemini 串接與「AI 為加分項非地基」原則。

### 知識庫(後台維護 + 一鍵彙整 + 一鍵翻譯)
- **中英兩份知識庫**,存於 Settings 的兩個長文欄位 `chatbotKnowledgeZh`(中文,主來源)與 `chatbotKnowledgeEn`(英文),後台皆可手動編輯。**英文版於維護時一次譯好並存檔**,聊天時依使用者語言直接取用對應欄位 —— **不在每次提問時即時翻譯**(把翻譯成本挪到維護時的單次操作,省 token、回應更快)。
- **「更新知識庫」按鈕**(後台知識庫頁):點擊 → server action **彙整全站內容**(直接讀 DB 已發布內容:成員、校友、論文、Blog、職缺、課程、產學專利、佈告欄等 + 階段一寫死區塊:研究領域、PI 理念、應徵範本、聯絡資訊)→ 丟 **Gemini 濃縮整理**成精簡、條理化、長度可控的客服知識庫 → **回填中文編輯欄位(尚未存檔)**。使用者檢視/微調後按「儲存」才寫入。
  - ⚠️ **「彙整」是直接讀資料來源(DB + 寫死區塊),非 HTTP 爬蟲**。理由:本就是同一個全端 App,直讀來源比抓渲染後 HTML 更準、更穩、自動排除草稿/隱藏頁。對使用者體驗仍是「按一下、內容自動跑出來」。
- **「翻譯」按鈕**(後台知識庫頁):點擊 → server action 取**目前中文編輯欄位的內容**丟 Gemini 翻成英文 → **回填英文編輯欄位(尚未存檔)**。使用者檢視/微調後按「儲存」才寫入。維護流程即:更新知識庫(產中文)→ 微調中文 → 翻譯(產英文)→ 微調英文 → 儲存。
  - **更新/翻譯皆 = 整份覆蓋對應編輯欄位**(不做合併):重產內容取代該欄位現值。覆蓋僅發生在編輯欄位,**按「儲存」前不影響線上聊天使用的知識庫**。
- 草稿/隱藏(`deletedAt` 非空或非 `PUBLISHED`)內容**不納入**彙整。
- **Blog 內文不入知識庫,改「問到才查」(function calling,方案 A)**:知識庫只放 Blog 的標題+摘要當索引;使用者問到某篇細節時,Gemini 自行呼叫 `getBlogContent` 工具 → server 端依 query 比對已發布文章、把該篇 Tiptap 內文抽成純文字回傳 → 模型據此作答。理由:Blog 全文若全塞知識庫太長、耗 token;讓模型自己決定何時撈、撈哪篇,天然解決中文斷詞且省 token。Blog 為已發布靜態內容,「問到才查」不違反「不查即時狀態」護欄(即時狀態如儀器可約與否仍一律導向頁面)。
- **Publications 含摘要(abstract)**:論文書目(作者/年份/標題/期刊)+ 摘要直接放入知識庫(資料量小,不需 function calling)。可答「論文主旨」;論文全文層級的細節不在系統內,一律引導 DOI/聯絡頁,不杜撰。

### 對話與護欄
- **多輪對話 + 串流**:支援連續追問(前端保留當輪歷史送回);回應逐字 streaming 顯示。對話歷史**僅存瀏覽器當次工作階段,不存 DB**(比照階段四聯絡訊息取捨)。
- **護欄**:system prompt 限定「只依知識庫回答與本實驗室/網站相關問題;知識庫沒有的就說不知道並引導至聯絡頁,不得杜撰人名/論文/數據;涉及即時資料(如某儀器現在是否可約)一律引導至對應頁面,不臆測」。
- **語系**:回答語言跟隨使用者提問語言(中文知識庫 → 英文問則翻譯作答);介面文案跟隨前台 [EN/中文] 切換。
- **開關**:`isAiEnabled()`(未設 `GEMINI_API_KEY` 即不渲染聊天入口)+ Settings 的 `showChatbot` 顯示/隱藏開關(沿用階段三「頁面顯示/隱藏」範式)。
- **防濫用**(聊天為公開、訪客可用,暴露面比階段六大):每 IP 速率限制 + 單則訊息長度上限 + 單輪對話則數上限(沿用階段四「記憶體 IP 限流」思路,並承認 serverless 多實例下非全域共享的限制)。

### 模組與檔案
- AI 程式集中 `src/lib/ai/chat.ts`(Gemini streaming + function calling + 組 system prompt)與 `src/lib/ai/knowledge.ts`(彙整全站內容 + 呼叫 Gemini 濃縮 + `getBlogContentByQuery` 供工具呼叫);與階段六 `gemini.ts` 同風格,換模型只動 AI 模組。
- API 端點 `src/app/api/chat/route.ts`(streaming/SSE + IP 限流)。
- 前台浮動視窗 `src/components/ChatWidget.tsx`(client),於 `layout.tsx` 依 `showChatbot` + `isAiEnabled()` 掛載;套 Dark Optics token 與重點色 `--accent`。
- Settings 加 `chatbotKnowledge`、`showChatbot` 欄位與後台知識庫頁。
- 聊天沿用既有 `GEMINI_API_KEY`(可選 `GEMINI_MODEL`),**無新金鑰**;更新 `docs/env-vars.md`、`.env.example` 說明即可。

**測試通過條件**(實作 + build/lint/typecheck 通過;需有效 `GEMINI_API_KEY` 之端到端人工點測由開發者進行)
- [x] 開啟聊天視窗,能就「研究方向 / 如何應徵 / 儀器預約規則 / 聯絡方式 / 某頁面在哪」得到符合網站內容的正確回答。〔`ChatWidget` + `/api/chat` + 知識庫含頁面導覽/儀器規則摘要〕
- [x] 串流逐字顯示正常;多輪追問能保留前文脈絡。〔`generateContentStream` → `ReadableStream`;前端保留 messages 歷史送回〕
- [x] 中文提問取中文知識庫、英文提問取已存的英文知識庫作答(非每次即時翻譯);介面文案隨前台語系切換。〔route 依 `lang` 取 `chatbotKnowledgeZh/En`〕
- [x] 護欄生效:無關問題婉拒並引導;即時資料問題導向對應頁面;知識庫沒有的事實回答「不確定」並引導聯絡頁,不杜撰。〔system prompt 護欄,見 `chat.ts`〕
- [x] 「更新知識庫」能彙整全站**已發布**內容(草稿/隱藏不納入)、經 Gemini 整理後回填中文編輯欄位;結果僅為待確認內容,未按儲存不影響線上聊天。〔`aggregateSiteContent` 只取 `status=PUBLISHED, deletedAt=null` → `condenseKnowledge`〕
- [x] 「翻譯」能將目前中文編輯欄位內容譯為英文回填英文編輯欄位;結果僅為待確認內容,未按儲存不影響線上聊天。〔`translateToEnglish` 回傳文字、前端填入 state,未存檔〕
- [x] 「更新」與「翻譯」皆為整份覆蓋對應編輯欄位(非合併);儲存後聊天即採用新知識庫。〔回傳整份取代 textarea state;`saveKnowledge` upsert〕
- [x] `showChatbot` 關閉或未設 `GEMINI_API_KEY` 時前台完全不出現聊天入口;Gemini 失效時「更新知識庫」報錯,但手動編輯/既有知識庫/網站其他功能不受影響。〔layout `showChatbot && isAiEnabled()` 才掛載;action try/catch〕
- [x] 防濫用生效:超過 IP 速率限制 / 訊息過長 / 單輪則數過多時正確擋下並提示。〔route:每 IP 10 分鐘 30 次、單則 ≤1000 字、歷史 ≤20 則〕

---

## 交付與交接(結案)
**範圍**:正式把專案擁有權與營運責任移交實驗室,開發者退場。對應「帳號歸屬與交接」。
- 三服務(GitHub、Vercel、Supabase)擁有權轉移至吳教授/實驗室:教授帳號設為 owner、開發者降級或退出。
- 確認 Supabase 付款方式(若已升 Pro)綁定教授/實驗室。
- (可選)若採用 Google Drive 備份備案,交付其設定與憑證歸屬。
- 交付操作說明:後台基本操作(發布內容、審核草稿、邀請會員、管理儀器)的簡要指引。

**測試通過條件**
- [ ] 三服務 owner 均為教授/實驗室,開發者已退出或降為協作者。
- [ ] 教授能以自己的帳號登入並存取三服務。
- [ ] 帳單/付款(如有)綁定教授/實驗室,不經開發者。
- [ ] 教授或助教能依指引完成一次內容發布與一次會員邀請。

---

# 附錄 G:內容區塊後台欄位(階段三)

### G-1. 動態佈告欄(Quantum Dashboard)
分類(學術快報/實驗室日常/榮譽榜)、標題、內文、圖片(選)、連結網址(選)、連結文字(選)、發布日期。

### G-2. Publications〔階段六可 AI 填〕
作者、論文標題、期刊名稱、發表年份、DOI 連結(選)、**摘要 abstract(選)**、精選 Highlight(是/否)。前台依年份倒序、精選加粗放大。〔摘要為階段七新增:供聊天機器人回答論文主旨;階段六 AI 抽取時一併抓取(有則原文抽取、無則留空,不杜撰)。前台顯示維持書目欄位,不顯示摘要。〕

### G-3. 現役成員
姓名、身份階層、照片(選)、研究題目、排序。
- **身份階層(`TeamTier`,14 種)**:實驗室主持人(PI)、教授、特聘教授、名譽教授、副教授、助理教授、客座教授、兼任教授、合作教授、博後、專任助理(非學生非教職的一般員工)、博士生、碩士生、專題生。〔原規格僅 4 種(博後/博士生/碩士生/專題生);吳教授要求補上教職、一般員工、實驗室主持人、合作教授等層級,於 adjustment 輪陸續擴充,沿革見開發日誌。〕
- **排序**:後台列表以**拖曳**調整(`sortOrder`),不再手填數字;且後台與前台皆**依層級分組**顯示,層級內順序由拖曳決定、跨層級順序固定(見 `team-content.tsx` 的 `TIER_ORDER`)。拖曳僅限**同層級內**(層級是身份,改層級須進編輯頁)。

### G-4. 歷屆成員去向〔原「校友去向」〕
姓名、畢業年份、去向、**照片(選)**、排序。
- 〔吳教授要求:標題由「校友去向」改為「歷屆成員去向」(英文維持 Alumni);去向加照片(前台列表 + 小圓頭像,可點擊放大);後台列表改**拖曳**排序(`sortOrder` 優先,取代原 `gradYear` 主排序)。沿革見開發日誌。〕

### G-5. 學術能階職缺表(職缺管理)
職位名稱、層級排序、招募狀態(開放/額滿)、名額(選)、職位說明。可新增/刪除整筆。

### G-6. Science Blog〔階段六可 AI 填〕
標題(中)、標題(英)、摘要、內文(中)、內文(英)、封面圖(選)、發布日期。

### G-7. 課程紀錄
課程名稱、大綱、講義下載連結。更新極慢。

### G-8. 產學與專利
已獲證專利清單、可授權技術清單、企業合作/技轉實績簡述。可由 Settings 控制是否顯示。

### G-9. 給高中生的話
引導文章內容(單篇長文)。可由 Settings 控制是否顯示。

---

# 附錄 H:儀器資料欄位(階段五)

| 欄位 | 型態 | 說明 |
|---|---|---|
| 儀器名稱 | 文字 | |
| 用途說明 | 長文 | |
| 負責人 email | email | 異常警報收件人 |
| 照片 | 圖片 | |
| 目前狀態 | 狀態 | 🟢正常運行 / 🟡維護中(與簽退連動) |
| (衍生)預約紀錄 | 關聯 | 預約時段、預約人、狀態(已預約/已取消/使用中·未簽退/已簽退/逾時) |
| (衍生)簽退/異常紀錄 | 關聯 | 時數、機況回報、異常描述 |
| 負責人 | 關聯 | 指派之負責會員(可多人),對應 B-2 儀器級權限 |

---

# 附錄 I:寫死區塊(不進後台,供對照)
應徵範本內容、導覽列、頁尾、語系切換。
- (產學與專利、給高中生的話已改為後台管理,見 G-8、G-9。)
- 〔adjustment 輪起,**首頁 Hero(標題/副標)、PI 理念、研究領域、聯絡基本資訊(實驗室名稱/地址/Email/電話/辦公時間)已改為後台 Settings 可編輯**(留空則 fallback 字典預設值);故不再純屬寫死區塊。維護位置:後台 → 設定 →「首頁文字」「聯絡資訊」。沿革見開發日誌。〕

---

## 待你確認/待決(彙整)
目前所有已討論項目均已定案,無待決問題。
(後續新需求或邊界情況浮現時,於對應階段補列。)

---

# 開發日誌(Development Log)

> 每完成一階段並通過測試後填寫(見文首「階段完成時的更新規則」)。
> 重點不是流水帳,而是記錄**偏差、踩坑與解法、技術債、給後續階段的提醒**——後者是給下次開發(含 Claude Code)的避坑提示。

### 階段零:環境與帳號建置
- 完成日期:2026-06-24
- 實際與規格的偏差:
  - GitHub repo 最終直接開在**教授個人帳號**(`az481863-stack/MJwebsite`)下,而非規格原本建議的 Organization 容器。因目標本就是歸屬教授名下,效果一致(開發者 `josh79622` 以 collaborator 身分參與)。日後若要團隊化再轉 Organization 即可。
- 遇到的問題與解決方案:
  1. **Supabase 連線完全失敗(P1001)**:密碼含特殊字元 `@` 與 `/`,未做 URL 編碼,導致連線字串解析時把密碼中段誤判成主機名(`Can't reach database server at MgrdrytLQP:5432`)。解法:`.env` 兩條連線字串的密碼改用 URL 編碼(`@`→`%40`、`/`→`%2F`)。
  2. **`prisma migrate` 永久卡死**:`prisma.config.ts` 的 `datasource` 只設了 `url: env("DATABASE_URL")`(連線池 6543),沒帶 `directUrl`,導致 migration 也走連線池;pgbouncer transaction 模式不支援 DDL/advisory lock,migrate 會無限等鎖。解法:`prisma.config.ts` 的 datasource 補上 `directUrl: env("DIRECT_URL")`(走直連 5432)。注意:Prisma 6.19 的 config **強制要有 datasource 區塊**,不能整段移除改靠 schema(會報 `Cannot destructure property 'url'`)。
  3. **Vercel build 失敗(PrismaConfigEnvError)**:`postinstall` 跑 `prisma generate` 時,`prisma.config.ts` 用 `env()` 嚴格要求 `DATABASE_URL`/`DIRECT_URL`,但 Vercel 環境沒這些變數(`.env` 不上傳)。解法:在 Vercel → Settings → Environment Variables 補上 5 個變數(DATABASE_URL、DIRECT_URL、NEXT_PUBLIC_SUPABASE_URL、NEXT_PUBLIC_SUPABASE_ANON_KEY、SUPABASE_SERVICE_ROLE_KEY),DATABASE_URL 密碼一樣要用已編碼版本。
- 衍生的新待辦/技術債:
  - 舊 Organization repo(`Meng-Jer-Wu-s-Team/MJwebsite`)未刪除,保留為孤兒(本機 `origin` 已改指新 repo,push 不會再進舊的,不影響運作)。日後若要清理需由 org admin 於網頁操作。
  - 交接時提醒:Vercel 環境變數、GitHub Actions 的 `SUPABASE_DB_URL` secret 都需隨擁有權一併移交/重設。
- 給後續階段的提醒:
  - **連線字串密碼一律 URL 編碼**,日後換密碼/重設時務必照做,否則重蹈問題 1。
  - **migration 走 DIRECT_URL(5432)、執行期走 DATABASE_URL(6543)** 的雙線設計要維持;新增 `env()` 依賴時記得 Vercel 也要同步補環境變數,否則 build 會掛(問題 3)。
  - GitHub Actions 保活已驗證可手動 `workflow_dispatch` 觸發;`SUPABASE_DB_URL` 用的是 DIRECT_URL。
  - **改 schema 並 `prisma migrate/generate` 後,正在跑的 `npm run dev`(Turbopack)務必重啟**:Turbopack 不會在 generate 後熱重載產生的 Prisma client,會繼續用舊版,導致儲存時報 `PrismaClientValidationError: Unknown argument <新欄位>`(錯誤裡「可用欄位」清單會停在加新欄位之前)。程式本身沒問題,重啟 dev server 即解。〔2026-06-30 加首頁可編輯欄位時踩到〕

### 階段一:靜態內容網站
- 完成日期:
- 實際與規格的偏差:
- 遇到的問題與解決方案:
- 衍生的新待辦/技術債:
- 給後續階段的提醒:

### 階段二:會員與權限系統
- 完成日期:2026-06-24
- 實際與規格的偏差:
  - **後台頁面(login / account / admin / setup)為中文單一語言**,不走前台 i18n 語系切換(內部成員使用)。前台公開頁仍維持 A-1 的雙語切換。
  - **邀請採自建 token**(`Invitation.tokenHash`,SHA-256 僅存雜湊),而非 Supabase 內建 invite email;密碼與 Google 仍由 Supabase Auth 管。寄信走 **Resend**(`src/lib/email.ts` 獨立模組,未設 `RESEND_API_KEY` 時開發期把連結印至 console)。
  - **首位最高權限者**:規格只說「不從邀請產生、由現任手動升級」,實作補上具體機制 → `/setup` 一次性網頁(`SETUP_SECRET` 密語 + 無超管才作用,建立後自動失效)與 `npm run seed:superadmin` 腳本。
  - Next 16 將 `middleware` 慣例**更名為 `proxy`**;session 刷新放 `src/proxy.ts`,matcher 僅套用 `/account`、`/admin`、`/auth`。
  - 導覽列登入狀態改用 **client 端 `useAuthState`**(瀏覽器查 session),讓公開頁維持靜態、不必每次打 DB。
- 遇到的問題與解決方案:
  1. **`/setup` 被當靜態頁凍結判斷**:該頁只用 Prisma、無 cookies,Next 預設靜態化 → 會在 build 期把「是否已有超管」凍結。解法:`export const dynamic = "force-dynamic"`。
  2. **公開頁被迫動態**:server component 內用 Supabase server client(讀 cookies)會讓頁面轉動態。為保前台靜態,改在導覽列以 client 端判斷登入狀態(見上)。
  3. **停用會員仍能登入**:只改 `Member.status=DISABLED` 不夠。解法:同時用 admin API `updateUserById(..., { ban_duration })` 封鎖 Supabase 登入,還原時解除 ban。
  4. **React 19 + server actions**:每個表單用 `useActionState`,回傳統一 `ActionResult { ok, message }`;會員列表每列獨立成 `MemberRowItem` 以容納各自的 action 狀態(避免在迴圈中用 hooks)。
- 衍生的新待辦/技術債:
  - **Google 登入/綁定需 Supabase 後台設定**才能用:啟用 Google provider、開啟 Manual Linking、設定 redirect URL(`<site>/auth/callback`),且 `NEXT_PUBLIC_SITE_URL` 要正確。未完成前 Google 流程無法端到端驗證。
  - **單一 Supabase 環境(無 staging)**:本機開發直接寫正式庫;測試資料需留意清理。
  - 啟用時若該 email 已存在於 `auth.users`(罕見邊界)會失敗並提示聯絡管理員,未做自動合併。
  - 正式寄信需設 `RESEND_API_KEY` + 驗證寄件網域(否則僅 console 備援)。
  - **Vercel 環境變數**需含:`SUPABASE_SERVICE_ROLE_KEY`、`NEXT_PUBLIC_SITE_URL`(設為部署網址,非 localhost,否則邀請連結錯誤)、`SETUP_SECRET`、`RESEND_API_KEY`。
- 給後續階段的提醒:
  - 取目前會員/權限一律用 `src/lib/auth.ts` 的 `getCurrentMember` / `getMemberAtLeast` / `roleAtLeast`;新後台頁沿用「server component 守衛 → 不足則 `redirect('/login')`」模式。
  - **後台 server action 必須自行檢查權限**(勿只靠 UI 隱藏);沿用回傳 `ActionResult` 給 `useActionState` 的慣例。
  - 階段三內容表記得帶 D 共用欄位(`created_by` / `updated_by` / `deleted_by`),以 `getCurrentMember()` 填入;草稿/審核與軟刪除可沿用此處 RBAC。
  - 階段三 Settings 的「頁面顯示/隱藏開關」需能控制導覽項;導覽目前寫死於 `src/lib/i18n/dictionary.ts` 的 `NAV_ITEMS`。

### 階段三:內容後台 CMS
- 完成日期:2026-06-24(實作與 build/lint/typecheck 通過;端到端人工點測由開發者進行中)
- 實際與規格的偏差:
  - **Publications 不使用 Tiptap**:其欄位為結構化引用資料(無內文 body),故為純表單;僅 **Blog 內文**用 Tiptap(已同步修正規格 §階段三)。
  - **後台中文單一語言**(延續階段二);內容資料多為單語(依附錄 G,僅 Blog 有中英雙版),前台切換 EN 時非 Blog 的內容顯示原輸入語言。
  - 新增 **2 個前台獨立頁**:`/courses`(課程)、`/for-students`(給高中生的話),由頁尾連結進入(導覽列維持 A-2 的 6 項)。`/for-students` 受 Settings 的 `showHighschool` 控制。
  - 前台內容頁改為 **force-dynamic**(請求時渲染),非靜態預渲染(原因見下「問題」)。
  - 導覽列調整:語系切換改為**滑動 switch 樣式**(中/EN);**登入後**右上顯示「管理」(→`/admin`)+「會員」(→`/account`),未登入顯示「登入」;會員頁(`/account`)移除原本的「會員管理」連結(改由導覽列「管理」進入)。導覽登入狀態仍以 client 端 `useAuthState` 判斷。
- 遇到的問題與解決方案:
  1. **build 期連 DB 失敗(PrismaClientInitializationError)**:前台內容頁原為靜態,build 時 7 個 worker 並行查 Supabase,免費層連線數上限導致 prerender 失敗(Vercel 部署也會隨機壞)。解法:內容頁加 `export const dynamic = "force-dynamic"`,移除 build 期 DB 依賴;`getSettings()` 也加 try/catch 容錯回預設值。
  2. **Tiptap v3 與 SSR**:(a) StarterKit v3 已內含 Link/Underline/Strike/Code/CodeBlock/HorizontalRule,勿重複加(會報重複擴充)。(b) 編輯器需 `immediatelyRender: false` 避免 Next SSR hydration 不一致。(c) 前台渲染用 `@tiptap/html/server` 的 `generateHTML`(非瀏覽器版),否則報 "can only be used in a browser"。
  3. **數學公式 SSR**:`generateHTML` 對 math 只輸出 `data-latex` 空 span,KaTeX 需 client 端渲染。解法:`MathUpgrader` client 元件於掛載後用 KaTeX 補渲染;`katex.min.css` 於 layout 全域載入。
  4. **prisma delegate 泛型操作**:通用發布/軟刪除 action 以模型名字串對應 `prisma[model]`,用白名單 + 單一 helper 收斂型別寬鬆處。
- 衍生的新待辦/技術債:
  - 內容頁 force-dynamic = 每次請求查 DB;規模小無妨,日後若要快取可改 ISR(`revalidateTag`)。
  - 圖片無「替代文字(alt)」欄位;無障礙日後可補。
  - Blog 內文搜尋、分頁未做(目前全列);量大再加。
  - Tiptap 內容為信任的後台輸入,`generateHTML` 後以 `dangerouslySetInnerHTML` 注入;若日後開放較低信任來源需加 sanitize。
  - `media` storage bucket 於首次上傳自動建立(public);交接時記得此 bucket 屬資料的一部分。
- 給後續階段的提醒:
  - 新增內容類型的範式:`prisma model` → `actions.ts`(create/update + 權限)→ 沿用通用 `content-actions`(發布/軟刪除)→ `form-kit` 表單 → `AdminListShell` 列表 → `registry.ts` 加側邊欄項 → 前台 server 頁(force-dynamic)抓 `status=PUBLISHED, deletedAt=null`。
  - 學生可投稿的類型在 `registry.ts` 設 `minRole: "STUDENT"`,並於 list/new/edit 與 action 內做 owner/draft 限制。
  - 階段五(儀器)可讀 `getSettings().instrumentMaxHours`(預設 24)作預約總時數上限;`showInstruments` 控制導覽入口。
  - 階段六 AI 預填寫入 Blog 的 Tiptap JSON 格式(`bodyZh`/`bodyEn`),與此處編輯器一致。

- **後記(2026-06-25):Dark Optics 改版 + Vercel 部署修復**
  - **視覺改版**:吳教授檢視階段一~三成品後,認為原「純白底」過白單調(參考 awwwards),拍板改為 **Dark Optics**:**淺色學院風為底 + 戲劇性近黑深色帶(Hero、理念帶)+ 可由後台調整的重點色**。⚠️ **踩坑記錄**:第一版誤把「暗色光學」理解成「全站全黑」,直接把 `globals.css` 的 `:root` token 翻深色 → 整站(含後台)變全黑,與教授核可的 preview/a(淺底 + 深色 Hero)不符,被退回重做。正解:`:root` 維持**淺色**,深色只用 `.band-dark` class 局部反轉 token,套在首頁 Hero 與理念帶。重點色 `--accent` 由後台 `Settings.siteAccent`(色票 key,定義於 `src/lib/accent.ts`)決定,`layout.tsx` server-side 注入 `<html style="--accent:…">`(無閃爍)。Hero 雷射光束/捲動淡入為 `.beam`/`.reveal`(globals.css)+ `Reveal` 元件。規格已同步更新 §A-1。
  - **踩坑(Prisma 在 Vercel runtime 找不到 query engine)**:部署後所有查 DB 的前台頁 500,錯誤為 `PrismaClientInitializationError: could not locate the Query Engine for runtime "rhel-openssl-3.0.x"`。根因:Prisma client 產在自訂路徑 `src/generated/prisma`,在 **Next 16(Turbopack)** 下,平台專屬的 Rust query engine(`.so.node`)不會被 file tracing 複製進 serverless function(`outputFileTracingIncludes` 在 Turbopack 下不可靠)。**解法**:改用 **client engine(Wasm query compiler)+ driver adapter** — schema generator 設 `engineType = "client"`(移除 binaryTargets),`src/lib/prisma.ts` 改用 `@prisma/adapter-pg`(`new PrismaPg({ connectionString: process.env.DATABASE_URL })`)。從此無原生二進位需打包,該類錯誤根除。新增 runtime 依賴 `@prisma/adapter-pg`、`pg`(務必在 `dependencies`)。本機已對 Supabase pooler 驗證可連、可查。
    - 排查心法:此症狀**與環境變數無關**(連線字串其實正確)。誤判點:(1) 舊 production 別名 `mjwebsite.vercel.app` 其實是 phase1/2 靜態首頁(`/research` 還 404),其「首頁正常」不代表 DB 可連;(2) `mjwebsite-beta` 是固定別名、不隨新 push 更新;真正的新建置在各自的 `mjwebsite-<hash>-…vercel.app`(且有 Deployment Protection,需登入才看得到)。診斷靠臨時 `/api/dbcheck` 端點回傳真實 Prisma 錯誤,查完已移除。
  - 給後續階段的提醒:新增前台頁沿用深色 token 即自動套主題;要用重點色用 `text-accent`/`bg-accent`/`border-accent` 或 `var(--accent)`。`prisma migrate dev` 因單一環境(無 staging)會直接改正式 Supabase DB,故新欄位部署前即已存在於正式庫;Vercel build 不跑 migrate。

### 階段四:聯絡表單與分類寄信
- 完成日期:2026-06-25(實作 + build/lint/typecheck 通過;前台表單渲染已驗證,實寄需設 RESEND_API_KEY)
- 實際與規格的偏差:
  - **收件信箱改用環境變數 `CONTACT_RECIPIENTS`(可多個,逗號分隔)**,三種分類都寄到同一組信箱(教授決定);非各分類分流到不同信箱。日後若要分流,改成「分類→信箱」對應即可。
  - **防濫用採「蜜罐欄位 + 每 IP 記憶體速率限制」**(非驗證碼),零外部依賴。蜜罐為隱藏 `company` 欄位(機器人填了即佯裝成功、不寄信);速率限制為 10 分鐘內每 IP 最多 3 次。
  - 寄信沿用階段二的 `src/lib/email.ts`(Resend);新增 `sendContactEmail`,並讓底層 `send()` 支援多收件人(`to: string|string[]`)與 `replyTo`(設為填表人 email,教授可直接回覆)。
- 遇到的問題與解決方案:
  - server action 取得用戶 IP:用 `next/headers` 的 `headers().get("x-forwarded-for")` 取第一段;Vercel 會帶此標頭。
  - i18n:server action 回傳「字典 key」(success / errRequired / errEmail / errCategory / errRate / errGeneric),前台依當前語系對應顯示,避免在 server 端寫死語言。
- 衍生的新待辦/技術債:
  - **記憶體速率限制在 serverless 多實例/冷啟動下非全域共享**,屬「基本防灌」;若日後濫用嚴重,改用 DB 計數或 Upstash/Redis、或加 Cloudflare Turnstile。
  - **聯絡訊息未存 DB**(僅寄信);若教授希望站內留存紀錄,需新增 `ContactMessage` 表(可順便做更可靠的速率限制)。
  - **Vercel 環境變數需新增 `CONTACT_RECIPIENTS`**(及確認 `RESEND_API_KEY`、已驗證寄件網域),否則正式站只會 console 印、不會真的寄。
  - **✅ 寄件端設定已完成(2026-06-26)**:原擱置的「Resend 測試位址只能寄給自己」問題已解決。已購入自有網域 `mjw-opto.com`,並於 Resend 驗證寄件子網域 **`mail.mjw-opto.com`**(DNS 由 Vercel 代管,region Tokyo `ap-northeast-1`;DKIM/SPF/DMARC 皆過,狀態 Verified)。正式寄件位址 `EMAIL_FROM="光電物理實驗室 <noreply@mail.mjw-opto.com>"`,可寄給任意收件人。**交接時 Resend 帳號 + 此網域應一併歸屬教授名下。** 細節見 `docs/env-vars.md`。
- 給後續階段的提醒:
  - 多收件人寄信、`replyTo` 已在 `email.ts` 備好,後續任何通知信(如階段五異常警報)可沿用同一 `send()`。

### 階段五:儀器預約管理系統
- 完成日期:2026-06-25(實作 + build/lint/typecheck 通過;cron/權限/gating 已本機冒煙驗證;端到端人工點測由開發者進行中)
- 實際與規格的偏差:
  - **排程改為「Next API route(`/api/cron`)+ GitHub Actions 每 15 分」+「頁面載入 lazy 對帳」**,未採規格原述的 pg_cron(與使用者確認)。理由:自動簽到→簽退義務、判逾時、算停權等業務邏輯放 TS 較易維護、可與既有程式共用、好測。**對帳邏輯集中於 `src/lib/instruments.ts` 的 `reconcile()`(冪等)**;cron 僅為備援,準確性由「相關頁面載入前先 `reconcile()`」保證(GitHub Actions 排程本就會延遲)。已同步更新規格 §排程的實作描述。
  - **預約時間模型=整點時段(每格 1 小時)**(與使用者確認):衝突 = 時段重疊;時數加總為整數。預約 UI 為「選日期→選整點起始→選時數」,client 送絕對時間 ISO(台灣 +08:00 整點對應到整點 UTC,故以 `getUTCMinutes()===0` 驗整點)。
  - **Supabase 維持免費層、暫不升 Pro**(與使用者確認);沿用既有 keepalive,儀器排程本身也會持續產生 DB 活動。
  - **儀器非草稿/審核內容**:不套 `ContentStatus`,以 `deletedAt` 軟刪除;故未用通用 `content-actions`,自建 `admin/instruments/actions.ts`。
  - **停權與額度為衍生計算,不另設表**:停權 = `status=OVERDUE` 筆數 ≥ 3;已用額度 = `status∈{BOOKED,IN_USE,OVERDUE}` 的時數加總(CHECKED_OUT/CANCELLED 釋放,OVERDUE 不返還直到被代簽)。代簽把 OVERDUE→CHECKED_OUT,停權/額度即自動恢復。
  - **機台狀態(🟢正常/🟡維護中)與簽退脫鉤、手動調整**(對應「代簽豁免」條款);簽退的機況回報(🟢/🟡/🔴)只決定是否寄異常警報,不自動改機台狀態。管理頁綜覽呈現各筆最新機況回報。
  - **負責人(即使全站角色是學生)可進 `/admin/instruments`**:後台 layout 本就只要求「有有效會員」,角色細分在各頁守衛;故在 layout 計算 `canManageInstruments` 控制側欄與頁面存取,負責人僅見/管自己負責的機台。
  - login 補上 `next` 支援(QR 簽退未登入需登入後返回):`login/page.tsx`、`login-form.tsx`(hidden + Google redirect)、`login/actions.ts` 皆只接受站內相對路徑。
- 遇到的問題與解決方案:
  1. **ESLint `react-hooks/purity` 擋 `Date.now()` 於 render**:預約面板與預約頁在 render 期呼叫 `Date.now()` 判過去時段被報錯。解法:client 端用 `const [now] = useState(() => Date.now())` 一次性取值;server 端改用頁面頂部既有的 `now` 變數。
  2. **`react-hooks/set-state-in-effect`**:預約成功的 effect 內呼叫 `setState` 重置選取被擋。解法:effect 只留 `router.refresh()`,選取狀態交由重繪後自然失效(server action 仍會再驗,故無風險)。
  3. **共用 `ContentFormShell` 的「將存為草稿」訊息不適用儀器**:儀器無草稿概念。解法:儀器表單自帶簡易 `useActionState` shell,不沿用該外殼。
  4. QR 產生:新增 `qrcode` 依賴,於管理頁 server 端 `QRCode.toDataURL(checkoutUrl)` 產 data URL 供列印(URL 用 `siteUrl()`)。
- 衍生的新待辦/技術債:
  - **`/api/cron` 與 GitHub Actions 需設 `CRON_SECRET`(Vercel+GitHub)與 `SITE_URL`(GitHub secret)**;未設 `CRON_SECRET` 時 `/api/cron` 回 503(已加入 `docs/env-vars.md`、`.env.example`)。實際排程實跑需部署後驗證。
  - 預約面板的 `now` 為一次性快照,長時間停留頁面不會自動把剛過的整點變灰;重新整理即更新。規模小可接受。
  - 預約時段為**全天 24 小時**、日期以**日曆(`<input type="date">`,min=今日)**選任意未來日(不再限 7 天/營業時段)。
  - 前台導覽該頁名稱為**「儀器介紹」**(`dictionary.ts` nav.instruments);頁面對所有人顯示儀器介紹,**預約區塊預設收合、須登入才可展開**(未登入/維護中/停權僅顯示原因,不出現預約區塊)。
  - 異常警報實寄走 Resend(寄件網域 `mail.mjw-opto.com` 已驗證,見階段四後記);未設 `RESEND_API_KEY` 時印 console。
  - 儀器照片沿用 `media` bucket 的 `instruments/` 資料夾;屬資料一部分,交接時一併。
- 給後續階段的提醒:
  - 任何需要「時間到自動變更狀態」的功能,沿用 `reconcile()` 的「冪等批次 + 頁面載入 lazy 呼叫 + cron 備援」範式,勿散落 setTimeout。
  - 儀器級權限一律用 `src/lib/instruments.ts` 的 `isManagerOf` / `managedInstrumentIds`;server action 必須自行檢查(勿只靠 UI)。

### 階段六:AI 輔助後台
- 完成日期:2026-06-27(實作 + build/lint/typecheck 通過;需有效 `GEMINI_API_KEY` 的端到端人工點測由開發者進行)
- 實際與規格的偏差:
  - **AI 落點為「建草稿 → 導既有編輯頁審核」**,而非「回填空白新增表單」(與使用者確認)。理由:完整重用既有編輯頁與 `TiptapEditor`(它本就會把 DB 的 Tiptap JSON 載回顯示),避免把 AI 產出的 Tiptap JSON 灌進「活的」前端編輯器實例這段易出包的接線;控制流全程 server-side(上傳→AI→建 DRAFT→redirect)。仍 100% 符合「預填僅為草稿、未審核不發布」。
  - **模型 Gemini `gemini-2.5-flash`**(可由 `GEMINI_MODEL` 覆寫),用新版 SDK `@google/genai` 的 structured output(`responseMimeType:"application/json"` + `responseSchema`)確保回傳乾淨 JSON。
  - **Word 處理:mammoth 抽全文再整份丟 Gemini**(Gemini 無法直接吃 .docx 二進位)。圖片:Publications 無關;Blog 偵測到圖則於內文插入佔位段落「請補圖」,實際圖由審核者於編輯器上傳(存 Supabase)。
  - **Blog 內文格式**:請 Gemini 輸出簡單 HTML → `@tiptap/html/server` 的 `generateJSON(html, tiptapExtensions)` 轉成合法 Tiptap doc JSON(只保留已知節點 = 天然 sanitize),與手填同格式。
  - 未設 `GEMINI_API_KEY` 時,Blog/Publications 列表頁不渲染「AI 快速新增」入口;`isAiEnabled()` 同時於 server action 再檢查。
- 遇到的問題與解決方案:
  - redirect 必須放在 try/catch **之外**(Next 的 `redirect()` 以丟例外實作,若被 catch 會誤判成 AI 失敗)。成功才 redirect;AI/解析失敗則回傳 `ActionResult{ok:false}` 不建草稿。
- 衍生的新待辦/技術債:
  - AI 串接無使用量上限(依使用者決定);Gemini 免費層額度足夠,日後若被濫用再加限流。
  - Blog 圖片不會自動搬運,靠審核者補;若日後要自動搬圖,需把 docx 內嵌圖上傳 Supabase 再寫入 Tiptap image 節點。
  - 多筆論文的 Word 目前只取第一筆(符合「每次只給新增那幾筆」慣例);若要批次,改成回傳陣列、逐筆建草稿。
  - **Vercel 需新增 `GEMINI_API_KEY`**(見 `docs/env-vars.md`、`.env.example`)。
- 給後續階段的提醒:
  - AI 相關程式集中在 `src/lib/ai/`(`gemini.ts`/`docx.ts`/`tiptap.ts`),與主流程隔離;換模型只動 `gemini.ts`。

### 部署效能後記(2026-06-28):Vercel 函式區域
- 問題:吳教授反映載入偏慢。診斷:回應標頭 `x-vercel-id` 為 `hkg1::iad1::…`,代表**函式實際跑在美東 `iad1`**,但 Supabase DB 在新加坡 → 每次請求「函式↔DB」跨太平洋來回,前台 `force-dynamic` 一頁多筆查詢,延遲被放大(遠大於「新加坡 vs 東京」的差距)。
- 解法:**函式與 DB 同區**。維持 DB 在新加坡,於根目錄新增 `vercel.json` 設 `{"regions":["sin1"]}`,並在 Vercel Settings → Functions 取消美東、只留 Singapore。驗證:`curl -sD - -o /dev/null https://mjw-opto.com/ | grep x-vercel-id` 應出現 `::sin1::`。
- 原則(已寫入規格 §部署):**函式區域永遠跟著 DB 區域**。若日後把 Supabase 搬到東京,`vercel.json` 同步改 `hnd1`。
- 排查心法:用 `x-vercel-id` 的 `<邊緣>::<函式區>::<id>` 格式判斷函式實際執行區;靜態檔走全球 CDN 不受此影響,只有動態 SSR 函式位置要顧。

### 階段七:AI 聊天機器人(FAQ / 網站導覽)
- 完成日期:2026-06-28(實作 + build/lint/typecheck 通過;需有效 `GEMINI_API_KEY` 的端到端人工點測由開發者進行)
- 實際與規格的偏差:
  - **知識庫由「單一中文」改為「中英雙欄 + 翻譯按鈕」**(與使用者確認,過程見規格沿革):一度規劃只存中文、英文提問即時翻譯;後考量「每次提問都翻譯較耗 token、較慢」,改為**維護時用「翻譯」按鈕一次譯好英文並存檔**,聊天時依語言直接取對應欄位。Settings 因此新增 `chatbotKnowledgeZh` / `chatbotKnowledgeEn` 兩欄 + `showChatbot` 開關。
  - **「彙整」直讀 DB + 寫死區塊,非 HTTP 爬蟲**:`aggregateSiteContent()`(`src/lib/ai/knowledge.ts`)直接查 `status=PUBLISHED, deletedAt=null` 的各內容表,並從 `dictionaries.zh` 取寫死區塊(Hero/研究領域/PI 理念/應徵範本/聯絡資訊),另手寫「網站頁面導覽」「儀器預約規則摘要」兩段供導覽問答。再丟 `condenseKnowledge()` 給 Gemini 濃縮成中文知識庫。
  - **更新/翻譯為「回傳文字、前端填入 textarea」而非直接寫庫**:server action 回傳結果,前端 `useState` 整份覆蓋欄位;按「儲存」(`saveKnowledge`)才 upsert。故「未存檔不影響線上聊天」由設計保證。
  - **Blog 內文(Tiptap JSON)未做全文抽取**:彙整時只取 `titleZh + summary`,避免在 server 端反序列化 Tiptap doc;對 FAQ/導覽足夠。日後若要全文檢索再補。
  - **串流用純文字而非 SSE 事件框架**:`/api/chat` 回 `text/plain` 串流,前端以 `response.body.getReader()` 逐塊 append,最簡且夠用。
- 遇到的問題與解決方案:
  - `callGeminiText`(純文字輸出)補進既有 `gemini.ts`,與階段六的 `callGeminiJson` 並存;聊天串流另寫在 `chat.ts`(`generateContentStream`)。換模型仍只動 `src/lib/ai/`。
- 衍生的新待辦/技術債:
  - **防濫用為記憶體限流**(每 IP 10 分鐘 30 次、單則 ≤1000 字、歷史 ≤20 則),serverless 多實例下非全域共享,屬「基本防灌」(同階段四取捨);若被濫用再上 Upstash/Redis 或 Turnstile。
  - **對話不存 DB**(僅當次工作階段);若日後想分析訪客問題需新增 `ChatLog` 表。
  - 知識庫**需手動先按「更新知識庫」+「翻譯」+「儲存」**才有內容;空知識庫時機器人會大多回「不確定」。交接說明應含此維護步驟。
  - **無新環境變數**:沿用 `GEMINI_API_KEY`(可選 `GEMINI_MODEL`)。前台聊天入口需「`showChatbot` 開 + 有金鑰」雙條件。
- 給後續階段的提醒:
  - 新增「需彙整全站內容」的 AI 功能,沿用 `aggregateSiteContent()` 的「直讀 DB 來源 + 過濾 PUBLISHED/deletedAt」範式,勿走 HTTP 爬蟲。
  - 知識庫維護流程(後台「聊天機器人知識庫」頁):更新知識庫(產中文)→ 微調 → 翻譯(產英文)→ 微調 → 儲存。
- **後記(2026-06-28):Blog 內文檢索(方案 A)+ Publications 摘要**
  - **Blog 改「問到才查」**:原知識庫只放 Blog 標題+摘要(全文太長、耗 token)。改在 `chat.ts` 加 Gemini **function calling** 工具 `getBlogContent`,模型需要時才呼叫 → `getBlogContentByQuery()`(`knowledge.ts`)依 query 比對已發布文章、把該篇 Tiptap JSON 以自寫的 `tiptapToPlainText()` 抽成純文字回傳 → 模型續答。串流實作為「function-calling 迴圈」:每輪 `generateContentStream`,若該輪出現 `functionCalls` 則執行工具、把 `functionCall`/`functionResponse` 接回 `contents` 進下一輪取最終答案(最多 3 輪)。選 function calling 而非關鍵字檢索,是因中文無空格、斷詞難,讓模型自己挑文章天然解決且省 token。
  - **Publications 加 `abstract` 摘要欄位**(schema 選填;migration `20260628034933_add_publication_abstract`):後台表單可手填,階段六 AI 抽取(`extractPublication`)一併抓(有則原文、無則空)。摘要量小,直接併入知識庫彙整(不走 function calling);讓機器人能答「論文主旨」,但論文全文細節仍引導 DOI/聯絡頁、不杜撰。前台 Publications 顯示維持書目欄位,不顯示摘要。
  - 護欄措辭更新:Blog 內文(已發布靜態內容)「問到才查」不違反「不查即時狀態」原則;真正禁止臆測的是即時狀態(儀器可約與否等),仍一律導向頁面。

### adjustment 輪:吳教授使用回饋修正(2026-06-30)
> 教授實際使用後提出的一批修正,完整逐項追蹤見 `docs/professor-feedback.md`。以下記重點偏差/決策/踩坑。

- **首頁與聯絡資訊改後台可編輯**:Hero 標題/副標、PI 理念、研究領域(標題/引言/卡片)、聯絡基本資訊(名稱/地址/Email/電話/辦公時間)原為寫死區塊,改為 `SiteSettings` 欄位 +「設定」頁編輯;留空 fallback 字典預設(以 placeholder 顯示)。規格已更新 §A-1、§階段三 Settings、§附錄 I。研究領域卡片格式為「一行一領域,`標題 | 說明`」;理念以空行分段。
- **中英翻譯走「存 DB + 一鍵翻譯」(路線 A)**:佈告欄/儀器/職缺加英文欄,Blog 補 `summaryEn`;編輯頁「一鍵翻譯成英文」(Gemini)產英文、可手改;前台依語系取、空值 fallback 中文。理由與階段七知識庫一致(維護時翻好、省 token、AI 為加分項非地基)。共用:`translateFieldsToEnglish`/`translate-action.ts`/`TranslateButton.tsx`。Blog 內文是 Tiptap JSON,故 `translateBlog(id)` 採「寫庫後 `window.location.reload()`」帶出英文編輯器(需先存草稿),避免注入活的編輯器。
- **成員層級擴充 + 分組**:`TeamTier` 由 4 種擴為 12 種(加 7 種教職 + 專任助理);前台與後台列表皆依層級分組,拖曳限同層級內。
- **全站排序一律拖曳**:所有有 `sortOrder` 的後台列表(現役成員、歷屆成員、儀器、課程、職缺、產學)改 dnd-kit 拖曳,**移除各表單手填「排序數字」欄位**,且 create/update 不再寫 `sortOrder`(只由拖曳的 `reorderXxx`/`reorderContent` 設定;新項目以預設 0 進場,編輯不再重置順序)。儀器拖曳限 ADMIN(負責人只見子集)。新增依賴 `@dnd-kit/{core,sortable,utilities}`。Publications(年份排)、Blog/佈告欄(日期排)無手動排序,不適用。
  - 踩坑:`AdminListShell` 是 server component 且 `renderRow` 函式無法跨 server→client 邊界。team(分層)/alumni/instrument(分層+權限)有特殊需求,各做專屬 client 列表;courses/jobs/industry 則用**通用 `src/app/admin/sortable-admin-list.tsx`**(以可序列化的 `primary/secondary/group` 描述列、`reorderContent(model,ids)` 通用 action、可選分組),避免再複製。
- **校友→歷屆成員去向**:改名(英文維持 Alumni)+ 加照片 + 拖曳(排序基準改 `sortOrder` 優先)。
- **排版「疊在一起」**:職缺、產學內文 `<p>` 漏 `whitespace-pre-wrap`,換行被摺疊;補上即解。與使用者確認不引入 Markdown/編輯器(僅需分段)。
- **共用元件**:圖片點擊放大抽成 `src/components/ZoomableImage.tsx`(儀器、團隊成員、歷屆成員共用)。
- 共新增 migration:home_editable_text、home_research_editable、alumnus_photo、dashboard_en、instrument_job_blog_en、team_tiers、contact_settings。
- 提醒:本輪大量改 schema,**每次 migrate/generate 後務必重啟 dev server**(Turbopack 不熱重載 Prisma client,否則儲存報 Unknown argument,見階段零提醒)。

### 交付與交接
- 完成日期:
- 實際與規格的偏差:
- 遇到的問題與解決方案:
- 衍生的新待辦/技術債:
- 給後續階段的提醒:
