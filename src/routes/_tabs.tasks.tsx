import { createFileRoute } from "@tanstack/react-router";
import { ListChecks } from "lucide-react";
import { ScreenHeader } from "@/components/nova/screen-header";
import { EmptyState } from "@/components/nova/empty-state";

export const Route = createFileRoute("/_tabs/tasks")({
  head: () => ({
    meta: [
      { title: "Tasks — D2D AI" },
      { name: "description", content: "Plan and complete your day in D2D AI." },
      { property: "og:title", content: "Tasks — D2D AI" },
      { property: "og:description", content: "Plan and complete your day." },
    ],
  }),
  component: Tasks,
});

function Tasks() {
  return (
    <div className="animate-fade-up">
      <ScreenHeader title="Tasks" subtitle="Small steps, steady progress." />
      <div className="px-5">
        <EmptyState
          icon={ListChecks}
          title="No tasks yet"
          description="Use Quick Capture to add your first task and start building momentum."
        />
      </div>
    </div>
  );
}
