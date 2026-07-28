import { useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type BaseItem = { id: string; createdAt: number; updatedAt: number };

type Mapper<T extends BaseItem> = {
  /** Convert a database row into the app-side item shape. */
  fromRow: (row: Record<string, unknown>) => T;
  /** Convert app-side fields into database columns (never includes id/user_id). */
  toRow: (patch: Partial<T>) => Record<string, unknown>;
};

export type CloudStore<T extends BaseItem> = {
  getAll: () => T[];
  get: (id: string) => T | undefined;
  add: (input: Omit<T, "id" | "createdAt" | "updatedAt">) => T;
  update: (id: string, patch: Partial<T>) => void;
  remove: (id: string) => void;
  subscribe: (l: () => void) => () => void;
  /** Load everything for the signed-in user from the cloud. */
  load: () => Promise<void>;
  /** Clear in-memory state (used on sign out). */
  clear: () => void;
  isLoaded: () => boolean;
};

const registry: Array<{ load: () => Promise<void>; clear: () => void }> = [];

export function loadAllCloudStores() {
  return Promise.all(registry.map((s) => s.load()));
}

export function clearAllCloudStores() {
  registry.forEach((s) => s.clear());
}

function tempId() {
  return `tmp_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

export function createCloudStore<T extends BaseItem>(
  table: string,
  mapper: Mapper<T>,
  opts?: { orderBy?: string; ascending?: boolean },
) {
  let items: T[] = [];
  let loaded = false;
  const listeners = new Set<() => void>();

  function emit() {
    listeners.forEach((l) => l());
  }

  function replace(id: string, next: T) {
    items = items.map((i) => (i.id === id ? next : i));
    emit();
  }

  const store: CloudStore<T> = {
    getAll: () => items,
    get: (id) => items.find((i) => i.id === id),
    isLoaded: () => loaded,

    add(input) {
      const now = Date.now();
      const optimistic = { ...(input as object), id: tempId(), createdAt: now, updatedAt: now } as T;
      items = [optimistic, ...items];
      emit();

      void (async () => {
        const { data, error } = await supabase
          .from(table as never)
          .insert(mapper.toRow(optimistic as Partial<T>) as never)
          .select()
          .single();
        if (error || !data) {
          // Roll back the optimistic row if the cloud rejected it.
          items = items.filter((i) => i.id !== optimistic.id);
          emit();
          console.error(`[${table}] insert failed`, error);
          return;
        }
        replace(optimistic.id, mapper.fromRow(data as Record<string, unknown>));
      })();

      return optimistic;
    },

    update(id, patch) {
      const previous = items.find((i) => i.id === id);
      if (!previous) return;
      items = items.map((i) => (i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i));
      emit();
      if (id.startsWith("tmp_")) return;

      void (async () => {
        const { error } = await supabase
          .from(table as never)
          .update(mapper.toRow(patch) as never)
          .eq("id", id);
        if (error) {
          items = items.map((i) => (i.id === id ? previous : i));
          emit();
          console.error(`[${table}] update failed`, error);
        }
      })();
    },

    remove(id) {
      const previous = items.find((i) => i.id === id);
      items = items.filter((i) => i.id !== id);
      emit();
      if (!previous || id.startsWith("tmp_")) return;

      void (async () => {
        const { error } = await supabase.from(table as never).delete().eq("id", id);
        if (error) {
          items = [previous, ...items];
          emit();
          console.error(`[${table}] delete failed`, error);
        }
      })();
    },

    async load() {
      const { data, error } = await supabase
        .from(table as never)
        .select("*")
        .order(opts?.orderBy ?? "created_at", { ascending: opts?.ascending ?? false });
      if (error) {
        console.error(`[${table}] load failed`, error);
        return;
      }
      items = ((data ?? []) as Record<string, unknown>[]).map(mapper.fromRow);
      loaded = true;
      emit();
    },

    clear() {
      items = [];
      loaded = false;
      emit();
    },

    subscribe(l) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };

  registry.push({ load: store.load, clear: store.clear });

  const EMPTY: T[] = [];

  function useAll(): T[] {
    return useSyncExternalStore(
      store.subscribe,
      () => items,
      () => EMPTY,
    );
  }

  function useOne(id: string): T | undefined {
    return useAll().find((i) => i.id === id);
  }

  function useLoaded(): boolean {
    return useSyncExternalStore(
      store.subscribe,
      () => loaded,
      () => false,
    );
  }

  return { store, useAll, useOne, useLoaded };
}
