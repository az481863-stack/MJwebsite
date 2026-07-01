# 吳教授使用回饋與修正追蹤

> 本文件記錄吳教授實際使用網站後提出的所有修正需求,逐項追蹤處理狀態。
> 狀態標記:⬜ 待處理 / 🔄 進行中 / ✅ 已完成

---

## 第一批回饋(2026-06-30)

### 一、首頁調整

| # | 項目 | 說明 | 狀態 |
|---|------|------|------|
| 1.1 | 首頁文字修正 | 改為後台可編輯首頁標題/副標/「主持人理念」內文/研究領域 | ✅ |
| 1.2 | 區塊順序重排 | 首頁區塊上下順序調整為:① 動態佈告欄(移至最上)② 研究領域 ③ 主持人理念(移至最下) | ✅ |

### 二、功能與排版優化

| # | 項目 | 說明 | 狀態 |
|---|------|------|------|
| 2.1 | 招募職缺排版修正 | 修復文字全部疊加在一起的排版錯誤 | ✅ |
| 2.2 | 儀器介紹互動優化 | 每台儀器說明可收合/展開;照片可點擊放大 | ✅ |
| 2.2b | 團隊成員照片放大 | 團隊成員照片也改為可點擊放大(沿用同一 lightbox) | ✅ |
| 2.3 | 後台人員排序 | 後台現役成員列表可拖曳排序(取代手填數字) | ✅ |
| 2.3b | 儀器管理排序 | 後台儀器管理列表可拖曳排序(限 ADMIN) | ✅ |
| 2.6 | 成員層級擴充 | 新增教職層級(教授/特聘/名譽/副/助理/客座/兼任)+ 專任助理(一般員工) | ✅ |
| 2.7 | 成員依層級分組 | 前台現役成員依層級分組顯示(層級內仍照拖曳順序);後台列表亦分層,拖曳限同層級內 | ✅ |
| 2.4 | 校友改版 | 改名「歷屆成員去向」、去向可放照片、後台可拖曳排序 | ✅ |
| 2.5 | 產學與專利排版修正 | 修復內文疊在一起的排版錯誤 | ✅ |

### 三、多國語系(中英文翻譯)

需修正以下頁面/區塊無法自動切換或翻譯成英文的問題,改為支援自動轉換:

| # | 項目 | 說明 | 狀態 |
|---|------|------|------|
| 3.1 | 佈告欄行事曆 | 後台加英文欄 + 一鍵翻譯;前台依語系切換、空值 fallback 中文 | ✅ |
| 3.2 | 光電部落格 | 加 summaryEn + 一鍵翻譯(含 Tiptap 內文)+ 前台 fallback | ✅ |
| 3.3 | 儀器說明 | 後台加英文欄 + 一鍵翻譯;儀器卡片依語系切換 | ✅ |
| 3.4 | 博士後徵才 | 職缺後台加英文欄 + 一鍵翻譯;前台依語系切換 | ✅ |

### 四、其他追加

| # | 項目 | 說明 | 狀態 |
|---|------|------|------|
| 4.1 | 聯絡資訊後台維護 | 聯絡頁實驗室名稱/地址/Email/電話/辦公時間改為後台 Settings 可編輯 | ✅ |
| 4.2 | 全站排序一律拖曳 | 課程/職缺/產學也改拖曳排序;抽通用 `SortableAdminList`;移除各表單手填排序數字 | ✅ |
| 4.3 | 課程/產學/給高中生的話 英文欄 | 三者加英文欄 + 一鍵 AI 翻譯;前台依語系切換、空值 fallback 中文 | ✅ |
| 4.4 | 研究領域首頁/研究頁一致 | 兩頁研究領域改用同一份後台資料 + 共用直式清單元件(padding 減半、間距縮小) | ✅ |

---

## 第三類(中英翻譯)決策(2026-06-30)

- **路線 A**(使用者拍板):後台為各內容類型加英文欄位,**維護時翻好存 DB**;前台切 EN 直接取英文欄,**空值 fallback 顯示中文**(部分翻譯也不會開天窗)。不採前台即時翻譯(B)。
- **填法**:編輯頁加「一鍵 AI 翻譯」按鈕(Gemini),自動填英文欄、教授可手改;沿用 phase 7 知識庫翻譯鈕範式。
- 理由:符合 Blog 既有雙語結構 + phase 7「翻譯成本挪到維護時、省 token、回應快」原則 + 「AI 為加分項非地基」(英文存 DB,AI 掛了英文站照常)。
- 現況差異:Blog 已是雙語結構(只缺 `summaryEn` 與英文常空);佈告欄/儀器/職缺為純單語、須加英文欄。

## 處理紀錄

### 1.1 首頁文字改為後台可編輯(2026-06-30 完成)
- 教授需求是「能從後台改」,而非一次性改字。首頁標題、副標、主持人理念原為**寫死區塊**(i18n 字典)。
- 作法:`SiteSettings` 新增 6 欄(中/英 × 標題/副標/理念內文),migration `20260630073300_add_home_editable_text`。
- 後台「設定」頁新增「首頁文字」區塊(6 個 textarea);**留空則沿用字典預設**(以 placeholder 顯示預設值供參考)。理念內文以**空行分段**。
- 前台 `home-content.tsx` 依當前語系(中/英)取後台值,空值 fallback 字典;標題/副標加 `whitespace-pre-line` 保留換行。
- 維護位置:後台 → 設定 → 首頁文字。中英分開填(呼應第三類翻譯需求,首頁文字本就雙語)。
- 檔案:`prisma/schema.prisma`、`src/lib/settings.ts`、`src/app/admin/settings/{actions,settings-form}.tsx`、`src/app/page.tsx`、`src/app/home-content.tsx`。

### 1.2 首頁區塊順序重排(2026-06-30 完成)
- `home-content.tsx`:Hero 之下的順序由 `[研究領域][主持人理念][動態佈告欄]` 改為 `[動態佈告欄][研究領域][主持人理念]`。
- 同步調整頁內導覽 `PageNav` 的 `navItems` 順序(佈告欄→研究→理念)。
- 視覺帶交替仍合理:Hero(深)→ 佈告欄(淺)→ 研究(淺)→ 理念(深)。

### 1.1 追加:研究領域也後台可編輯(2026-06-30)
- 教授追加需求:首頁「研究領域」也要可後台編輯。
- `SiteSettings` 再加 6 欄(中/英 × 標題/引言/各領域卡片),migration `20260630074513_add_home_research_editable`。
- 各領域卡片格式:**一行一個領域,`標題 | 說明`**;留空沿用字典預設(placeholder 顯示預設)。
- `home-content.tsx` 解析後依語系渲染,空值 fallback。
- 維護位置:後台 → 設定 → 首頁文字 → 研究領域。

### 2.1 + 2.5 排版「疊在一起」修正(2026-06-30 完成)
- 根因(兩處同一個):職缺說明與產學內文都以 `<p>{text}</p>` 渲染,HTML 預設會把換行/空行摺疊成一個空格,導致教授在後台用換行排版的內容前台全擠成一坨。
- 修法:兩個 `<p>` 加 `whitespace-pre-wrap`(保留換行+自動換行),與首頁佈告欄內文一致。維持純文字、不引入 Markdown/編輯器(與使用者討論後決定:職缺/產學僅需分段,投報率最高)。
- 檔案:`src/app/team/team-content.tsx`(職缺)、`src/app/research/research-content.tsx`(產學)。

### 2.2 儀器說明可收合 + 照片點擊放大(2026-06-30 完成)
- 儀器前台頁(`/instruments`)為 server component;收合與圖片放大都需 client 互動,故抽出 `src/app/instruments/instrument-card.tsx`(client)取代原本內嵌的「照片+名稱+說明」區塊;`InstrumentBooking` 維持不變,仍在同一張卡片內。
- 說明收合:文字偏長(>80 字或含換行)時 `line-clamp-3` 收合,附「展開全部/收合」鈕(以字數/換行判斷,不量測 DOM,避免 `react-hooks/set-state-in-effect`)。
- 照片放大:縮圖改為按鈕,點擊開 lightbox(`fixed inset-0` 半透明黑底全螢幕);點背景或按 Esc 關閉,開啟時鎖背景捲動。
- `page.tsx` 移除不再使用的 `next/image` import(改由卡片元件處理)。

### 2.2b 團隊成員照片也可點擊放大(2026-06-30 完成)
- 為避免重複,把放大邏輯抽成共用元件 `src/components/ZoomableImage.tsx`(縮圖按鈕 + lightbox + Esc/背景關閉 + 鎖捲動),`thumbClassName` 控制縮圖樣式。
- `instrument-card.tsx` 重構為改用 `ZoomableImage`(移除自帶的 lightbox);`team-content.tsx` 成員照片也改用之(移除 `next/image` import)。

### 2.3 後台現役成員拖曳排序(2026-06-30 完成)
- 痛點:`sortOrder` 早已存在,但只能逐一進每位成員編輯頁手填數字、插隊還要重算,極不直覺。
- 採拖曳(使用者選 B):引入 `@dnd-kit/core` `@dnd-kit/sortable` `@dnd-kit/utilities`(React 生態主流)。
- 後台「現役成員」列表改 client 元件 `team-list.tsx`(垂直可排序),拖曳握把 ⠿;放開 → `reorderTeam(orderedIds)` server action 於交易內把 `sortOrder` 設為新索引(順帶把舊的全 0 資料正規化成連續序號)→ `router.refresh()`。樂觀更新即時呈現。
- `AdminListShell` 為 server component 且 `renderRow` 函式無法跨 server→client 邊界,故 team 改用專屬 client 列表;`StatusBadge`/`ContentRowActions`(皆 client)沿用,已刪除區與新增鈕留在 `page.tsx`。`page.tsx` 以「id+status 簽章」當 `key`,發布/刪除後重掛取最新、純排序不重掛。
- 無 migration(`sortOrder` 既有)。前台 `/team` 本就以 `sortOrder` 升冪排,拖曳結果即時反映。
- 檔案:`src/app/admin/team/{actions,page}.tsx`、新增 `src/app/admin/team/team-list.tsx`。

### 2.4 歷屆成員去向:改名 + 照片 + 拖曳排序(2026-06-30 完成)
- **改名**:中文「校友去向」→「歷屆成員去向」(字典 `alumniHeading`、`emptyAlumni`、admin registry 標籤、新增/編輯頁標題、knowledge.ts);**英文維持 "Alumni"**(使用者選擇)。
- **照片**:`Alumnus` 加 `photoUrl String?`,migration `20260630104210_add_alumnus_photo`;後台表單加 `ImageUpload`(folder `alumni/`),actions parse/create/update 一併存。前台採「**列表 + 小圓頭像**」(使用者選擇):有照片用 `ZoomableImage`(可點擊放大),無照片顯示姓名首字佔位圓。
- **拖曳排序**(使用者追加,比照 2.3):新增 `reorderAlumni` action + client `alumni-list.tsx`;admin alumni 頁改用拖曳列表。**排序基準由 `gradYear desc` 改為 `sortOrder asc` 優先**(前台 team/page 與 admin 同步),否則拖曳會與年份排序打架。
- 檔案:`prisma/schema.prisma`、`src/lib/i18n/dictionary.ts`、`src/lib/cms/registry.ts`、`src/lib/ai/knowledge.ts`、`src/app/team/{page,team-content}.tsx`、`src/app/admin/alumni/{actions,page,alumni-form}.tsx`、`src/app/admin/alumni/[id]/page.tsx`、`src/app/admin/alumni/new/page.tsx`、新增 `src/app/admin/alumni/alumni-list.tsx`。
- 衍生:`team-list.tsx` 與 `alumni-list.tsx` 高度雷同,日後第三個需要拖曳排序的類型出現時可抽成通用 client `SortableList`(以 render prop 提供握把);目前兩份夠清楚,暫不過度抽象。

### 2.3b 儀器管理拖曳排序(2026-06-30 完成)
- 比照 2.3,新增 `reorderInstruments` action(限 ADMIN)+ client `instrument-admin-list.tsx`(含綜覽/編輯/刪除列操作)。
- **僅 ADMIN 使用拖曳**:負責人(非 ADMIN)在儀器管理頁只看到自己負責機台的子集,對子集排序無意義且會擾動全域順序,故維持原靜態清單。
- `page.tsx`:`isAdmin ? <InstrumentAdminList key={id:status 簽章}/> : 原靜態 <ul>`。無 migration(`sortOrder` 既有);前台 `/instruments` 本就照 `sortOrder` 排。
- 至此三類拖曳列表(team/alumni/instrument)雷同度更高,未來可一併抽象成通用 `SortableList`。

### 2.6 現役成員層級擴充(2026-06-30 完成)
- 需求:現役成員除學生外,要能標示教職與一般員工。
- `TeamTier` enum 由 4 種擴為 12 種,migration `add_team_tiers`:
  - 教職 7 種:`PROFESSOR` 教授、`DISTINGUISHED_PROFESSOR` 特聘教授、`EMERITUS_PROFESSOR` 名譽教授、`ASSOC_PROFESSOR` 副教授、`ASST_PROFESSOR` 助理教授、`VISITING_PROFESSOR` 客座教授、`ADJUNCT_PROFESSOR` 兼任教授。
  - 一般員工:`STAFF` 專任助理(EN: Research Assistant)— 使用者選定。
  - 原有:`POSTDOC`/`PHD`/`MASTER`/`UNDERGRAD` 保留。
- 同步更新所有層級標籤處:字典 `tierLabels`(型別 + zh + en)、後台表單 select、`team-list.tsx` TIER_LABEL、`actions.ts` TIERS 驗證、`team-content.tsx` 改用 Prisma `TeamTier` 型別、`knowledge.ts` 改用 `tierLabels` 中文標籤(原本輸出 enum key)。
- 層級僅為標籤,前台順序仍由拖曳(`sortOrder`)決定,不分組。
- 檔案:`prisma/schema.prisma`、`src/lib/i18n/dictionary.ts`、`src/app/admin/team/{team-form,team-list,actions}.tsx`、`src/app/team/team-content.tsx`、`src/lib/ai/knowledge.ts`。

### 2.7 現役成員前台依層級分組(2026-06-30 完成)
- 前台 `/team` 現役成員由「單一拖曳順序網格」改為**依層級分組**:`team-content.tsx` 加 `TIER_ORDER`(與後台下拉同序),逐層級 filter + 渲染子標題(`tierLabels`)+ 卡片網格。
- **層級內**仍照後台拖曳(`sortOrder`)順序;**跨層級**由 `TIER_ORDER` 決定區塊先後。卡片移除原本的層級小標(改由區塊標題呈現),姓名標籤降為 `<h4>`。
- 空層級不顯示。純前台改動,無 migration。
- 前台卡片改為「各自有框 + 間距」(`grid gap-4` + 每卡 `border`),取代原本「無縫格線」做法——奇數時最後一張卡片不再留下被框住的空格(使用者回饋)。
- 後台 `team-list.tsx` 也分層:依 `TIER_ORDER` 分組,每層級各一個 `SortableContext`;`onDragEnd` 限制**同層級內**才排序(層級是身份,不由拖曳改變),跨層級拖曳忽略。每層級下標題用 `TIER_LABEL`,列內移除原本的層級小字。

### 3.1–3.4 中英翻譯(路線 A + 一鍵翻譯)(2026-06-30 完成)
- **共用基礎**:
  - `src/lib/ai/gemini.ts` 加 `translateFieldsToEnglish(fields)`:動態 JSON schema 逐鍵中→英翻譯(空值略過)。
  - `src/app/admin/translate-action.ts`:共用 server action `translateFieldsAction`(STUDENT 以上、`isAiEnabled` 守衛、try/catch)。
  - `src/components/admin/TranslateButton.tsx`:client 按鈕,`collect()` 收中文、`apply()` 填英文 state。
- **3.1 佈告欄**:schema 加 `titleEn/bodyEn/linkTextEn`(migration `add_dashboard_en`);表單英文欄改 controlled + 翻譯鈕(`formRef` 讀中文);分類英文標籤 `CATEGORY_LABEL_EN`;`home-content.tsx` 依 `lang` 取英文、空值 fallback 中文。
- **3.3 儀器**:schema 加 `nameEn/purposeEn`(migration `add_instrument_job_blog_en`);表單同上;`instrument-card.tsx` 改用 `useLanguage` 依語系取(含收合鈕英文化)。
- **3.4 職缺**:schema 加 `titleEn/descriptionEn`(同上 migration);表單在 `ContentFormShell` 內以 `document.getElementById` 收中文 + 翻譯鈕;`team-content.tsx` 職缺依 `lang` 取。
- **3.2 Blog**:Blog 本已雙語(titleZh/En、bodyZh/En),補 `summaryEn`(同上 migration)。內文是 Tiptap JSON,故採**寫庫後 reload**:`ai-actions.ts` 的 `translateBlog(id)` 把已存中文(標題/摘要/內文 zh→HTML→翻譯→Tiptap)翻好寫回英文欄;`blog-translate-button.tsx`(需先存草稿)→ `window.location.reload()` 帶出英文編輯器。前台列表/詳情頁英文空白時 fallback 中文(`isEmptyDoc` 判斷內文)。
- **填法慣例**:中文填好 → 按「一鍵翻譯」→ 檢查英文 → 儲存。英文留空前台自動顯示中文,不開天窗。AI 未設金鑰時翻譯鈕報錯,但雙語欄位與手填完全不受影響(AI 為加分項非地基)。
- **未納入**:前台頁面框架文案(如儀器頁標題、我的預約等)仍中文;本次只處理教授點名的 4 類「內容」。

### 4.1 聯絡資訊後台維護(2026-06-30 完成)
- 聯絡頁基本資訊原寫死於字典(附錄 I);改為後台 Settings 可編輯,沿用 1.1 範式(留空 fallback 字典)。
- `SiteSettings` 加 8 欄,migration `add_contact_settings`:名稱/地址/辦公時間中英各一(隨語系切換);Email/電話語言中性單欄。
- 後台「設定 → 聯絡資訊」區塊;`contact-content.tsx` 依語系取值、空值 fallback;heading/intro/欄位標籤與表單仍用字典。
- 檔案:`prisma/schema.prisma`、`src/lib/settings.ts`、`src/app/admin/settings/{actions,settings-form}.tsx`、`src/app/contact/{page,contact-content}.tsx`。

### 4.2 全站排序一律拖曳(2026-06-30 完成)
- 需求:全站排序一律用拖曳。有 `sortOrder` 又還在手填的剩課程、職缺、產學;一併改拖曳。
- 抽出通用 `src/app/admin/sortable-admin-list.tsx`(client 全外殼:標題+新增+可拖曳列表+已刪除區),列以可序列化資料描述(`primary/secondary/group`),避免跨 server→client 傳函式;可選 `groups` 分組(僅同組內拖曳,供產學依分類)。
- 通用 reorder:`content-actions.ts` 加 `reorderContent(model, ids)`(沿用既有 model 白名單;`Promise.all` 批次設 `sortOrder=索引`)。
- courses/jobs/industry 後台頁改用 `SortableAdminList`(取代 `AdminListShell`);industry 以 `CAT_GROUPS` 分組(與前台 CAT_ORDER 一致)。
- **移除所有手填排序欄位**:6 種表單(team/alumni/jobs/courses/industry/instrument)移除「排序數字」輸入;create/update 不再寫 `sortOrder`(改由拖曳專責),新項目以 schema 預設 0 進場(可再拖曳定位),**編輯不再重置排序**。
- 既有的 team(分層)/alumni/instrument(限 ADMIN、含分層與權限)維持各自專屬 client 列表;courses/jobs/industry 用新通用元件。Publications(年份排)、Blog/佈告欄(日期排)無手動排序,不適用。

### 4.3 課程/產學/給高中生的話 加英文欄 + 一鍵翻譯(2026-07-01 完成)
- 沿用 3.1–3.4 的路線 A + `TranslateButton`/`translateFieldsAction` 機制;migration `add_course_industry_highschool_en`。
- **課程 Course**:加 `nameEn`/`outlineEn`;`course-form` 英文欄 controlled + 翻譯鈕(collect 讀 name/outline);`courses-content` 依語系取、fallback。
- **產學 IndustryItem**:加 `titleEn`/`descriptionEn`;`industry-form` 同上;`research-content` 依語系取、fallback(分類分組不變)。
- **給高中生的話 HighSchoolMessage**:加 `contentEn`;單篇長文,`highschool-form` 加英文 textarea(controlled)+ 翻譯鈕(formRef 讀 content);`for-students` 依語系取、fallback。
- 填法一致:中文填好 → 一鍵翻譯 → 檢查 → 儲存;英文留空前台顯示中文。

### 4.4 研究領域:首頁與研究頁一致 + 統一樣式(2026-07-01 完成)
- 需求:研究頁的研究領域區塊要和首頁一模一樣、皆由後台控制;採研究頁的直式清單排版(吳教授偏好),但**每項間距縮小、框框 padding 減半**。並解決首頁 grid 奇數留灰色空格問題。
- 作法:抽共用元件 `src/components/ResearchAreas.tsx`(直式編號清單,`p-4` 半 padding、`space-y-px` 緊湊),吃 Settings 的 `homeResearchAreasZh/En`(留空 fallback 首頁字典)。
- 首頁 `home-content.tsx` 移除原 3 欄 grid、改用 `ResearchAreas`;研究頁 `research-content.tsx` 原本吃 `t.research.areas`(不同內容)改為吃同一份 Settings 資料(`research/page.tsx` 傳入)。兩頁自此完全一致、單一維護點(後台 → 設定 → 首頁文字 → 研究領域)。
- 附帶:直式清單無空格,首頁不再出現奇數灰色空框。
