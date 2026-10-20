import { useCallback, useState } from "react";

/** จำแถวที่ติ๊ก checkbox ไว้ในตาราง ใช้ Set จะได้เช็คแถวละ O(1) */
export function useRowSelection<T extends string = string>() {
  const [selected, setSelected] = useState<Set<T>>(() => new Set());

  const toggle = useCallback((id: T) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  /** ติ๊กครบทุกแถวที่ส่งมาแล้วจะเป็นการเอาออก ไม่ครบจะเป็นการเลือกให้ครบ */
  const toggleAll = useCallback((ids: T[]) => {
    setSelected((current) => {
      const next = new Set(current);
      const allSelected = ids.length > 0 && ids.every((id) => current.has(id));
      ids.forEach((id) => (allSelected ? next.delete(id) : next.add(id)));
      return next;
    });
  }, []);

  const clear = useCallback(() => setSelected(new Set()), []);

  const isSelected = (id: T) => selected.has(id);
  const isAllSelected = (ids: T[]) => ids.length > 0 && ids.every((id) => selected.has(id));

  return {
    selected,
    count: selected.size,
    isSelected,
    isAllSelected,
    toggle,
    toggleAll,
    clear,
  };
}
