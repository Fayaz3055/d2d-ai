import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppSettings = {
  notificationsEnabled: boolean;
};

const STORAGE_KEY = "d2d.settings.v1";
const DEFAULTS: AppSettings = { notificationsEnabled: true };

function readLocal(): AppSettings {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? { ...DEFAULTS, ...(JSON.parse(raw) as Partial<AppSettings>) } : DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}

let settings: AppSettings = readLocal();
const listeners = new Set<() => void>();

function emit() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    /* noop */
  }
  listeners.forEach((l) => l());
}

export const settingsStore = {
  get: () => settings,
  subscribe(l: () => void) {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
  /** Apply a change locally and mirror it to the cloud for cross-device sync. */
  set(patch: Partial<AppSettings> & { theme?: string }) {
    const { theme, ...local } = patch;
    settings = { ...settings, ...local };
    emit();
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) return;
      const row: Record<string, unknown> = { user_id: data.user.id };
      if (local.notificationsEnabled !== undefined)
        row.notifications_enabled = local.notificationsEnabled;
      if (theme !== undefined) row.theme = theme;
      await supabase.from("user_settings").upsert(row as never, { onConflict: "user_id" });
    })();
  },
  /** Pull the cloud copy after sign-in. Returns the stored theme, if any. */
  async load(): Promise<string | null> {
    const { data, error } = await supabase
      .from("user_settings")
      .select("theme, notifications_enabled")
      .maybeSingle();
    if (error || !data) return null;
    settings = { ...settings, notificationsEnabled: Boolean(data.notifications_enabled) };
    emit();
    return (data.theme as string) ?? null;
  },
};

export function useSettings(): AppSettings {
  return useSyncExternalStore(
    settingsStore.subscribe,
    () => settings,
    () => DEFAULTS,
  );
}

/** Hydrates settings from the cloud once the user is signed in. */
export function useSettingsSync(onTheme?: (theme: string) => void) {
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user || cancelled) return;
      const theme = await settingsStore.load();
      if (theme && !cancelled) onTheme?.(theme);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
