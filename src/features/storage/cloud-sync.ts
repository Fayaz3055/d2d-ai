import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { clearAllCloudStores, loadAllCloudStores } from "./create-cloud-store";

/**
 * Loads every cloud-backed collection for the signed-in user and clears
 * them again on sign out. Mounted once inside the authenticated layout.
 */
export function useCloudSync() {
  useEffect(() => {
    let cancelled = false;

    supabase.auth.getUser().then(({ data }) => {
      if (!cancelled && data.user) void loadAllCloudStores();
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        clearAllCloudStores();
        return;
      }
      if (event === "SIGNED_IN" || event === "USER_UPDATED") {
        void loadAllCloudStores();
      }
    });

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
    };
  }, []);
}
