"use client";

// 共用「向下捲動隱藏、向上捲動顯示」狀態。
// 導覽列與本頁籤條(PageNav)共用同一個來源,確保兩者同步移動,
// 避免導覽列收起後籤條留在原處產生空隙。

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const ScrollHideContext = createContext(false);

export function ScrollHideProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      // 向下且離開頂端 → 隱藏;向上 → 顯示。
      setHidden(y > lastY.current && y > 80);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <ScrollHideContext.Provider value={hidden}>
      {children}
    </ScrollHideContext.Provider>
  );
}

export function useScrollHidden(): boolean {
  return useContext(ScrollHideContext);
}
