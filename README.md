# 光電物理實驗室網站

吳教授光電物理實驗室的官方網站與後台。完整規格與分階段交付計畫見 [CLAUDE.md](./CLAUDE.md)。

## 技術棧
- **框架**:Next.js(App Router、TypeScript)
- **樣式**:Tailwind CSS(極簡學院風)
- **資料庫 / Auth / Storage**:Supabase(PostgreSQL)
- **ORM**:Prisma
- **富文本**:Tiptap(Blog / Publications,階段三起)
- **部署**:GitHub → Vercel 自動部署

## 開發

```bash
npm install
cp .env.example .env   # 填入 Supabase 連線資訊(取得方式見 docs/SETUP.md)
npm run dev            # http://localhost:3000
```

資料庫遷移(`.env` 填妥後):

```bash
npx prisma migrate dev   # 套用 schema 到資料庫
npx prisma studio        # 視覺化檢視資料
```

## 文件
- [CLAUDE.md](./CLAUDE.md) — 專案單一事實來源:規格、分階段計畫、開發日誌。
- [docs/SETUP.md](./docs/SETUP.md) — 階段零帳號設定逐步清單(GitHub / Supabase / Vercel)。

## 目前進度
階段零(環境與帳號建置)進行中:本機骨架已建立,等候外部帳號(Supabase 等)就位。
