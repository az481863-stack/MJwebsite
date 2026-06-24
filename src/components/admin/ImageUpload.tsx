"use client";

// 共用圖片上傳元件:選圖 → 瀏覽器壓縮 → 上傳 Supabase Storage → 預覽。
// 以隱藏 input(name)輸出圖片公開網址,供表單送出。
// 重用於佈告欄、成員照片、Blog 封面等。

import Image from "next/image";
import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { uploadImage } from "@/app/admin/upload-actions";

export function ImageUpload({
  name,
  folder,
  defaultUrl,
  label = "圖片",
}: {
  name: string;
  folder: string;
  defaultUrl?: string | null;
  label?: string;
}) {
  const [url, setUrl] = useState<string>(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setBusy(true);
    try {
      // 上傳前壓縮(守住免費層空間、加快載入)。
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.6,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      });
      const fd = new FormData();
      fd.append("file", compressed, compressed.name);
      fd.append("folder", folder);
      const res = await uploadImage(fd);
      if (res.ok && res.url) {
        setUrl(res.url);
      } else {
        setError(res.message ?? "上傳失敗。");
      }
    } catch {
      setError("圖片處理失敗,請換一張試試。");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div>
      <span className="block text-sm font-medium">{label}(選填)</span>
      <input type="hidden" name={name} value={url} />

      {url ? (
        <div className="mt-2 flex items-start gap-3">
          <Image
            src={url}
            alt="預覽"
            width={160}
            height={120}
            unoptimized
            className="h-24 w-auto border border-line object-cover"
          />
          <button
            type="button"
            onClick={() => setUrl("")}
            className="text-sm text-muted underline-offset-4 hover:text-red-600 hover:underline"
          >
            移除
          </button>
        </div>
      ) : (
        <div className="mt-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFile}
            disabled={busy}
            className="block w-full text-sm text-muted file:mr-3 file:border file:border-line file:bg-background file:px-3 file:py-1.5 file:text-sm hover:file:bg-foreground hover:file:text-background"
          />
          {busy && <p className="mt-1 text-xs text-muted">壓縮並上傳中…</p>}
        </div>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
