import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Trust headers set below, after a real getUser() check. Stripped from the
// incoming request first so a client can never inject its own value and
// have it mistaken for something the proxy validated.
const TRUST_HEADER_ID = "x-admin-user-id";
const TRUST_HEADER_EMAIL = "x-admin-user-email";

export async function updateSession(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete(TRUST_HEADER_ID);
  requestHeaders.delete(TRUST_HEADER_EMAIL);

  // Supabase isn't configured yet — let the request through. The admin
  // dashboard layout's requireUser() will surface a friendly error via
  // admin/error.tsx instead of crashing here in the proxy.
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  let pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          pendingCookies = cookiesToSet;
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isLoginRoute = pathname === "/admin/login";

  if (isAdminRoute && !isLoginRoute && !user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isLoginRoute && user) {
    const url = request.nextUrl.clone();
    url.pathname = "/admin";
    return NextResponse.redirect(url);
  }

  // Hand the already-validated identity to the admin layout so it doesn't
  // need its own getUser() round-trip on every navigation. Only ever set
  // here, only after a real check above — never derived from client input.
  if (user) {
    requestHeaders.set(TRUST_HEADER_ID, user.id);
    if (user.email) requestHeaders.set(TRUST_HEADER_EMAIL, user.email);
  }

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  pendingCookies.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options)
  );
  return response;
}
