import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { BottomNav } from "@/components/nova/bottom-nav";
import { QuickCaptureSheet } from "@/components/nova/quick-capture-fab";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_tabs")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth/sign-in" });
    return { user: data.user };
  },
  component: TabsLayout,
});


function TabsLayout() {
  return (
    <div className="relative min-h-dvh bg-background">
      <div className="mx-auto max-w-xl pb-32">
        <Outlet />
      </div>
      <QuickCaptureSheet />
      <BottomNav />
    </div>
  );
}
