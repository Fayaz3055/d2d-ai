import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { useCloudSync } from "@/features/storage/cloud-sync";

/**
 * Auth gate for every private, non-tab screen (lists, details, captures,
 * settings, insights). Keeps cloud data loading on direct entry / refresh.
 */
export const Route = createFileRoute("/_app")({
  ssr: false,
  beforeLoad: async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error || !data.user) throw redirect({ to: "/auth/sign-in" });
    return { user: data.user };
  },
  component: AppLayout,
});

function AppLayout() {
  useCloudSync();
  return <Outlet />;
}
