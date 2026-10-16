import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Database } from "@/lib/types";

/**
 * Cookie-free client for anonymous, publicly-readable data (site settings,
 * active services/hero-slides/portfolio, etc). Unlike `createClient()` below,
 * this never touches `cookies()` — a Next.js Dynamic API that would otherwise
 * force every route calling it into fully dynamic, uncached SSR on every
 * request. Only use this for reads RLS already grants to the `anon` role;
 * never for admin writes or any row that RLS hides from anon (e.g. inactive
 * services/slides looked up by id for editing).
 */
export function createAnonClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from a Server Component render — safe to ignore
            // because the proxy already refreshes the session.
          }
        },
      },
    }
  );
}

/**
 * Defense-in-depth check for Server Actions and admin pages. RLS already
 * blocks writes from unauthenticated requests, but every mutation should
 * still verify the session itself rather than relying on the proxy alone.
 */
export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return user;
}
