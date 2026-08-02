import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only helpers for acting as the signed-in user (RLS applies).
 * Never import this from client code.
 */
export type UserClient = SupabaseClient;

function keys() {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_ANON_KEY"] ?? process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return null;
  return { url, key };
}

export function bearerToken(request: Request): string | null {
  const auth = request.headers.get("authorization");
  return auth?.startsWith("Bearer ") ? auth.slice(7) : null;
}

export function createUserClient(token: string): UserClient | null {
  const env = keys();
  if (!env) return null;
  const { url, key } = env;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        headers.set("apikey", key);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

/** Validates the request bearer token; returns the user id and a user-scoped client. */
export async function requireUser(
  request: Request,
): Promise<{ userId: string; client: UserClient } | null> {
  const token = bearerToken(request);
  if (!token) return null;
  const client = createUserClient(token);
  if (!client) return null;
  const { data, error } = await client.auth.getUser(token);
  if (error || !data.user) return null;
  return { userId: data.user.id, client };
}
