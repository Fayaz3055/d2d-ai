import { useSyncExternalStore } from "react";

export type AvatarEmotion =
  | "idle"
  | "happy"
  | "thinking"
  | "listening"
  | "celebrating"
  | "sleeping"
  | "greeting";

export type AvatarState = {
  /** Current speech line, empty when the avatar is quiet. */
  message: string;
  emotion: AvatarEmotion;
  minimized: boolean;
  /** Draggable position, px offsets from the viewport right / bottom. */
  offset: { x: number; y: number };
  /** Bumped on every new utterance so the bubble can re-animate. */
  seq: number;
};

const POS_KEY = "d2d.avatar.pos";
const MIN_KEY = "d2d.avatar.min";

function readStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

let state: AvatarState = {
  message: "",
  emotion: "idle",
  minimized: false,
  offset: { x: 0, y: 0 },
  seq: 0,
};

const listeners = new Set<() => void>();
let hydrated = false;
let quietTimer: ReturnType<typeof setTimeout> | undefined;

function emit() {
  for (const l of listeners) l();
}

function set(patch: Partial<AvatarState>) {
  state = { ...state, ...patch };
  emit();
}

export const avatarStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    if (!hydrated) {
      hydrated = true;
      state = {
        ...state,
        offset: readStored(POS_KEY, { x: 0, y: 0 }),
        minimized: readStored(MIN_KEY, false),
      };
    }
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,

  /** Speak one short line with an emotion; auto-quiets after a while. */
  speak(message: string, emotion: AvatarEmotion = "happy", ms = 7000) {
    if (!message) return;
    if (quietTimer) clearTimeout(quietTimer);
    set({ message, emotion, minimized: false, seq: state.seq + 1 });
    quietTimer = setTimeout(() => set({ message: "", emotion: "idle" }), ms);
  },

  /** Show an emotion without saying anything (e.g. thinking while streaming). */
  feel(emotion: AvatarEmotion) {
    set({ emotion });
  },

  hush() {
    if (quietTimer) clearTimeout(quietTimer);
    set({ message: "", emotion: "idle" });
  },

  setMinimized(minimized: boolean) {
    set({ minimized, message: minimized ? "" : state.message });
    try {
      window.localStorage.setItem(MIN_KEY, JSON.stringify(minimized));
    } catch {
      /* storage unavailable */
    }
  },

  setOffset(offset: { x: number; y: number }, persist = false) {
    set({ offset });
    if (persist) {
      try {
        window.localStorage.setItem(POS_KEY, JSON.stringify(offset));
      } catch {
        /* storage unavailable */
      }
    }
  },
};

const serverSnapshot: AvatarState = {
  message: "",
  emotion: "idle",
  minimized: false,
  offset: { x: 0, y: 0 },
  seq: 0,
};

export function useAvatar() {
  return useSyncExternalStore(
    avatarStore.subscribe,
    avatarStore.getSnapshot,
    () => serverSnapshot,
  );
}
