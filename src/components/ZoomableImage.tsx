"use client";

// 可點擊放大的圖片(client)。縮圖為按鈕,點擊開 lightbox 全螢幕顯示;
// 點背景或按 Esc 關閉,開啟時鎖背景捲動。供儀器照片、團隊成員照片等共用。

import Image from "next/image";
import { useEffect, useState } from "react";

export function ZoomableImage({
  src,
  alt,
  width,
  height,
  thumbClassName = "",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  thumbClassName?: string;
}) {
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (!zoom) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [zoom]);

  return (
    <>
      <button
        type="button"
        onClick={() => setZoom(true)}
        aria-label={`放大「${alt}」`}
        className="shrink-0"
      >
        <Image
          src={src}
          alt={alt}
          width={width}
          height={height}
          unoptimized
          className={`cursor-zoom-in transition-opacity hover:opacity-80 ${thumbClassName}`}
        />
      </button>

      {zoom && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          onClick={() => setZoom(false)}
          className="fixed inset-0 z-50 flex cursor-zoom-out items-center justify-center bg-black/80 p-4"
        >
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={900}
            unoptimized
            className="max-h-[90vh] w-auto max-w-[90vw] object-contain"
          />
        </div>
      )}
    </>
  );
}
