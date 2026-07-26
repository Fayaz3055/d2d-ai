import { useSyncExternalStore } from "react";

export type BaseItem = { id: string; createdAt: number; updatedAt: number };

export function createCollectionStore<T extends BaseItem>(storageKey: string) {
  let items: T[] = [];

  if (typeof window !== "undefined") {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) items = parsed as T[];
      }
    } catch {
      /* noop */
    }
  }

  const listeners = new Set<() => void>();
  function emit() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      /* noop */
    }
    listeners.forEach((l) => l());
  }

  function uid() {
    return Math.random().toString(36).slice(2) + Date.now().toString(36);
  }

  const store = {
    getAll: () => items,
    get: (id: string) => items.find((i) => i.id === id),
    add(input: Omit<T, "id" | "createdAt" | "updatedAt">): T {
      const now = Date.now();
      const item = {
        ...(input as object),
        id: uid(),
        createdAt: now,
        updatedAt: now,
      } as T;
      items = [item, ...items];
      emit();
      return item;
    },
    update(id: string, patch: Partial<T>) {
      items = items.map((i) =>
        i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i,
      );
      emit();
    },
    remove(id: string) {
      items = items.filter((i) => i.id !== id);
      emit();
    },
    replaceAll(next: T[]) {
      items = next;
      emit();
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => listeners.delete(l);
    },
  };

  const EMPTY: T[] = [];

  function useAll(): T[] {
    return useSyncExternalStore(
      store.subscribe,
      () => items,
      () => EMPTY,
    );
  }


  function useOne(id: string): T | undefined {
    const all = useAll();
    return all.find((i) => i.id === id);
  }

  return { store, useAll, useOne };
}
