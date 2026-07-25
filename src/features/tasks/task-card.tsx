import { useNavigate } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { MoreHorizontal, Calendar, Trash2, Pencil, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { tasksStore } from "./use-tasks";
import type { Task } from "./types";
import { PriorityBadge, CategoryBadge } from "./badges";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ConfirmDeleteDialog } from "@/components/nova/confirm-delete";

function formatDue(due: string): string | null {
  if (!due) return null;
  const d = new Date(due + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const SWIPE_THRESHOLD = 90;

export function TaskCard({ task, index = 0 }: { task: Task; index?: number }) {
  const navigate = useNavigate();
  const [dx, setDx] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [removed, setRemoved] = useState(false);
  const [sparkle, setSparkle] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const startX = useRef<number | null>(null);
  const dragging = useRef(false);

  const dueLabel = formatDue(task.dueDate);
  const overdue =
    !!task.dueDate &&
    !task.completed &&
    new Date(task.dueDate + "T00:00:00").getTime() < new Date().setHours(0, 0, 0, 0);

  const handleComplete = () => {
    if (task.completed) {
      tasksStore.toggle(task.id);
      return;
    }
    setSparkle(true);
    setCompleting(true);
    window.setTimeout(() => {
      tasksStore.toggle(task.id);
      setCompleting(false);
      setSparkle(false);
    }, 420);
  };

  const handleEdit = () => navigate({ to: "/tasks/$id/edit", params: { id: task.id } });
  const handleOpen = () => navigate({ to: "/tasks/$id", params: { id: task.id } });

  const onPointerDown = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest("[data-no-swipe]")) return;
    startX.current = e.clientX;
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || startX.current == null) return;
    const delta = e.clientX - startX.current;
    setDx(Math.max(-140, Math.min(140, delta)));
  };
  const onPointerUp = () => {
    if (!dragging.current) return;
    dragging.current = false;
    const d = dx;
    setDx(0);
    startX.current = null;
    if (d <= -SWIPE_THRESHOLD) {
      handleComplete();
    } else if (d >= SWIPE_THRESHOLD) {
      handleEdit();
    }
  };

  const revealLeft = dx > 8; // right-swipe reveals edit on left
  const revealRight = dx < -8; // left-swipe reveals complete on right

  return (
    <div
      className={cn(
        "relative select-none transition-[opacity,transform] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
        removed && "pointer-events-none scale-95 opacity-0",
        completing && "scale-[0.98] opacity-70",
      )}
      style={{
        animation: `nova-fade-up 500ms cubic-bezier(0.22,1,0.36,1) both`,
        animationDelay: `${index * 40}ms`,
      }}
    >
      {/* Swipe backgrounds */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-between overflow-hidden rounded-2xl px-6">
        <span
          className={cn(
            "flex items-center gap-2 text-xs font-semibold text-primary transition-opacity",
            revealLeft ? "opacity-100" : "opacity-0",
          )}
        >
          <Pencil className="h-4 w-4" /> Edit
        </span>
        <span
          className={cn(
            "flex items-center gap-2 text-xs font-semibold text-primary transition-opacity",
            revealRight ? "opacity-100" : "opacity-0",
          )}
        >
          Complete <Check className="h-4 w-4" />
        </span>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{ transform: `translateX(${dx}px)`, transition: dragging.current ? "none" : "transform 300ms cubic-bezier(0.22,1,0.36,1)" }}
        className={cn(
          "nova-card relative flex items-start gap-3 p-4",
          task.completed && "opacity-70",
        )}
      >
        {/* Checkbox */}
        <button
          type="button"
          data-no-swipe
          aria-label={task.completed ? "Mark incomplete" : "Complete task"}
          onClick={(e) => {
            e.stopPropagation();
            handleComplete();
          }}
          className={cn(
            "relative mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-full border-2 transition-all",
            task.completed
              ? "border-primary bg-primary text-primary-foreground shadow-[0_0_0_4px_oklch(0.72_0.14_85/0.15)]"
              : "border-border bg-background hover:border-primary/60",
          )}
        >
          <Check
            className={cn(
              "h-3.5 w-3.5 transition-all duration-300",
              task.completed ? "scale-100 opacity-100" : "scale-50 opacity-0",
            )}
            strokeWidth={3}
          />
          {sparkle && (
            <span aria-hidden className="pointer-events-none absolute inset-0">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <span
                  key={i}
                  className="absolute left-1/2 top-1/2 h-1 w-1 rounded-full bg-primary"
                  style={{
                    animation: `nova-sparkle 500ms cubic-bezier(0.22,1,0.36,1) both`,
                    animationDelay: `${i * 20}ms`,
                    transform: `rotate(${i * 60}deg) translateY(-14px)`,
                  }}
                />
              ))}
            </span>
          )}
        </button>

        {/* Body */}
        <button
          type="button"
          onClick={handleOpen}
          className="min-w-0 flex-1 text-left"
        >
          <h3
            className={cn(
              "truncate text-[15px] font-semibold tracking-tight text-foreground",
              task.completed && "line-through decoration-primary/60",
            )}
          >
            {task.title}
          </h3>
          {task.description ? (
            <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {task.description}
            </p>
          ) : null}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            {dueLabel ? (
              <span
                className={cn(
                  "inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground",
                  overdue && "border-[oklch(0.88_0.08_25)] bg-[oklch(0.96_0.05_25)] text-[oklch(0.55_0.18_25)]",
                )}
              >
                <Calendar className="h-3 w-3" />
                {dueLabel}
              </span>
            ) : null}
            <PriorityBadge value={task.priority} />
            <CategoryBadge value={task.category} />
          </div>
        </button>

        {/* Menu */}
        <div data-no-swipe>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Task actions"
                className="flex h-8 w-8 flex-none items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem onClick={handleOpen}>Open details</DropdownMenuItem>
              <DropdownMenuItem onClick={handleEdit}>
                <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleComplete}>
                <Check className="mr-2 h-3.5 w-3.5" />
                {task.completed ? "Mark incomplete" : "Mark complete"}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      <ConfirmDeleteDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        onConfirm={() => {
          setRemoved(true);
          window.setTimeout(() => {
            tasksStore.remove(task.id);
            toast("Task deleted");
          }, 260);
        }}
      />
    </div>
  );
}
