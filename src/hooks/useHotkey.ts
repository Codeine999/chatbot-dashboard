import { useEffect } from "react";

/** ฟังคีย์ลัดแบบ ⌘/Ctrl + key เช่น useHotkey("k", () => setOpen(true)) */
export function useHotkey(key: string, handler: () => void) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === key) {
        event.preventDefault();
        handler();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [key, handler]);
}
