import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "d2d.draft.";

export function useDraft<T extends Record<string, unknown>>(key: string, initial: T) {
  const storageKey = PREFIX + key;
  const [data, setData] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);
  const initialRef = useRef(initial);

  // Load draft on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setData({ ...initialRef.current, ...JSON.parse(raw) });
    } catch {
      /* noop */
    }
    setHydrated(true);
  }, [storageKey]);

  // Persist on change (debounced-ish via microtask)
  useEffect(() => {
    if (!hydrated) return;
    try {
      const isEmpty = Object.values(data).every(
        (v) => v === "" || v === undefined || v === null,
      );
      if (isEmpty) localStorage.removeItem(storageKey);
      else localStorage.setItem(storageKey, JSON.stringify(data));
    } catch {
      /* noop */
    }
  }, [data, hydrated, storageKey]);

  const update = useCallback(
    <K extends keyof T>(field: K, value: T[K]) =>
      setData((prev) => ({ ...prev, [field]: value })),
    [],
  );

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
    } catch {
      /* noop */
    }
    setData(initialRef.current);
  }, [storageKey]);

  const isDirty =
    hydrated &&
    JSON.stringify(data) !== JSON.stringify(initialRef.current);

  return { data, setData, update, clear, isDirty, hydrated };
}
