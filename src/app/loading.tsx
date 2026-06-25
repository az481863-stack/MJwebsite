// 全域換頁遮罩(App Router 原生 loading 機制)。
// 換頁到 server-render(force-dynamic)頁面時,於資料準備期間自動覆蓋此遮罩,
// 讓使用者知道「處理中」。fixed 全螢幕,連 navbar 一起蓋住並輕微模糊。
// 注意:一般 API/server action 不走此遮罩,改用各按鈕的 pending(就地回饋)。

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-background/70 backdrop-blur-sm"
    >
      <span aria-hidden className="laser-loader" />
      <span className="text-xs font-medium uppercase tracking-[0.2em] text-muted">
        載入中…
      </span>
    </div>
  );
}
