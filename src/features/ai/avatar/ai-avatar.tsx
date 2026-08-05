import { useCallback, useEffect, useMemo, useRef } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronRight, Minus, Sparkles } from "lucide-react";
import { avatarStore, useAvatar } from "./avatar-store";
import { encouragementFor, greetingFor, timeOfDay } from "./reactions";
import { useTasks, useTasksLoaded } from "@/features/tasks/use-tasks";
import { cn } from "@/lib/utils";

const DAY = 86_400_000;
const GREETED_KEY = "d2d.avatar.greeted";

function startOfDay(t: number) {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/**
 * The D2D AI Avatar — a small floating, draggable companion that reacts to what
 * the user does. Purely presentational: all speech arrives through avatarStore.
 */
export function AiAvatar() {
  const { message, emotion, minimized, offset, seq } = useAvatar();
  const navigate = useNavigate();
  const tasks = useTasks();
  const loaded = useTasksLoaded();

  const stats = useMemo(() => {
    const today = startOfDay(Date.now());
    const open = tasks.filter((t) => !t.completed);
    return {
      today: open.filter((t) => t.dueDate && startOfDay(new Date(t.dueDate).getTime()) === today)
        .length,
      overdue: open.filter(
        (t) => t.dueDate && startOfDay(new Date(t.dueDate).getTime()) < today,
      ).length,
      completedYesterday: tasks.filter(
        (t) => t.completedAt && startOfDay(t.completedAt) === today - DAY,
      ).length,
      completedThisWeek: tasks.filter((t) => t.completedAt && t.completedAt > Date.now() - 7 * DAY)
        .length,
      streak: countStreak(tasks.map((t) => t.completedAt).filter(Boolean) as number[]),
    };
  }, [tasks]);

  // Daily greeting: once per app open, and only after data has landed.
  const greeted = useRef(false);
  useEffect(() => {
    if (greeted.current || !loaded) return;
    greeted.current = true;
    const stamp = sessionStorage.getItem(GREETED_KEY);
    if (stamp === String(startOfDay(Date.now()))) return;
    sessionStorage.setItem(GREETED_KEY, String(startOfDay(Date.now())));
    const line = greetingFor(stats);
    const t = setTimeout(() => avatarStore.speak(line.text, line.emotion, 9000), 900);
    return () => clearTimeout(t);
  }, [loaded, stats]);

  // Gentle encouragement, at most once per session and never over a greeting.
  useEffect(() => {
    if (!loaded) return;
    if (sessionStorage.getItem("d2d.avatar.encouraged")) return;
    const t = setTimeout(() => {
      const line = encouragementFor(stats);
      if (!line) return;
      sessionStorage.setItem("d2d.avatar.encouraged", "1");
      avatarStore.speak(line.text, line.emotion, 8000);
    }, 75_000);
    return () => clearTimeout(t);
  }, [loaded, stats]);

  // Dragging — offsets are measured from the bottom-right so it stays anchored.
  const drag = useRef<{ id: number; x: number; y: number; ox: number; oy: number; moved: boolean } | null>(
    null,
  );

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      drag.current = {
        id: e.pointerId,
        x: e.clientX,
        y: e.clientY,
        ox: offset.x,
        oy: offset.y,
        moved: false,
      };
    },
    [offset],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = d.x - e.clientX;
    const dy = d.y - e.clientY;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) d.moved = true;
    const maxX = Math.max(0, window.innerWidth - 96);
    const maxY = Math.max(0, window.innerHeight - 180);
    avatarStore.setOffset({
      x: Math.min(maxX, Math.max(-8, d.ox + dx)),
      y: Math.min(maxY, Math.max(-8, d.oy + dy)),
    });
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      const d = drag.current;
      drag.current = null;
      if (!d || d.id !== e.pointerId) return;
      avatarStore.setOffset(offset, true);
      if (!d.moved) {
        if (message) navigate({ to: "/ai" });
        else avatarStore.speak("I'm here. Tap again to open our conversation.", "listening", 5000);
      }
    },
    [message, navigate, offset],
  );

  const sleeping = emotion === "sleeping" || (!message && timeOfDay() === "night");

  if (minimized) {
    return (
      <button
        type="button"
        onClick={() => avatarStore.setMinimized(false)}
        aria-label="Show D2D AI avatar"
        className="fixed bottom-28 right-0 z-40 flex h-9 w-7 items-center justify-center rounded-l-full border border-border/70 border-r-0 bg-card/90 text-primary shadow-[var(--shadow-soft)] backdrop-blur-xl"
      >
        <Sparkles className="h-3.5 w-3.5" />
      </button>
    );
  }

  return (
    <div
      className="fixed z-40 flex flex-col items-end gap-2"
      style={{ right: 16 + offset.x, bottom: 104 + offset.y }}
    >
      {message ? (
        <div
          key={seq}
          className="animate-fade-up flex max-w-[min(19rem,calc(100vw-4rem))] items-start gap-2 rounded-3xl rounded-br-lg border border-primary/20 bg-card/85 px-3.5 py-2.5 shadow-[var(--shadow-card)] backdrop-blur-xl"
        >
          <p className="min-w-0 flex-1 text-[12.5px] leading-relaxed text-foreground">{message}</p>
          <button
            type="button"
            onClick={() => avatarStore.hush()}
            aria-label="Dismiss message"
            className="mt-0.5 shrink-0 text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : null}

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => avatarStore.setMinimized(true)}
          aria-label="Minimize D2D AI avatar"
          className="flex h-6 w-6 items-center justify-center rounded-full border border-border/70 bg-card/80 text-muted-foreground opacity-70 backdrop-blur-xl transition-opacity hover:opacity-100"
        >
          <Minus className="h-3 w-3" />
        </button>

        <div
          role="button"
          tabIndex={0}
          aria-label="D2D AI companion"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (drag.current = null)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") navigate({ to: "/ai" });
          }}
          className={cn(
            "avatar-orb relative h-14 w-14 cursor-grab touch-none select-none rounded-full",
            "border border-primary/25 bg-card/70 backdrop-blur-xl",
            "shadow-[var(--shadow-float)] active:cursor-grabbing",
            sleeping ? "avatar-sleeping" : "avatar-breathing",
            emotion === "thinking" && "avatar-thinking",
            emotion === "listening" && "avatar-listening",
            emotion === "celebrating" && "avatar-celebrating",
          )}
        >
          <span className="avatar-halo pointer-events-none absolute inset-0 rounded-full" />
          <svg viewBox="0 0 64 64" className="relative h-full w-full p-2.5" aria-hidden="true">
            <defs>
              <linearGradient id="d2dAvatarGold" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="oklch(0.86 0.09 88)" />
                <stop offset="100%" stopColor="oklch(0.66 0.14 82)" />
              </linearGradient>
            </defs>
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="url(#d2dAvatarGold)"
              strokeWidth="1.25"
              opacity="0.55"
            />
            <circle
              className="avatar-ring"
              cx="32"
              cy="32"
              r="19"
              fill="none"
              stroke="url(#d2dAvatarGold)"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeDasharray="66 54"
            />
            <circle cx="32" cy="32" r="11" fill="url(#d2dAvatarGold)" opacity="0.16" />
            <circle className="avatar-core" cx="32" cy="32" r="6.5" fill="url(#d2dAvatarGold)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/** Consecutive days (counting back from today) with at least one completion. */
function countStreak(completions: number[]) {
  if (!completions.length) return 0;
  const days = new Set(completions.map((t) => startOfDay(t)));
  let streak = 0;
  let cursor = startOfDay(Date.now());
  if (!days.has(cursor)) cursor -= DAY;
  while (days.has(cursor)) {
    streak += 1;
    cursor -= DAY;
  }
  return streak;
}
