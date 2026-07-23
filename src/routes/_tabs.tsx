import { createFileRoute, Outlet } from "@tanstack/react-router";
import { BottomNav } from "@/components/nova/bottom-nav";
import { QuickCaptureFab } from "@/components/nova/quick-capture-fab";

export const Route = createFileRoute("/_tabs")({
  component: TabsLayout,
});

function TabsLayout() {
  return (
    <div className="relative min-h-dvh bg-background">
      <div className="mx-auto max-w-xl pb-32">
        <Outlet />
      </div>
      <QuickCaptureFab />
      <BottomNav />
    </div>
  );
}
