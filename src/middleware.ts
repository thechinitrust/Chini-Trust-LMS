import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

type CookieToSet = { name: string; value: string; options: CookieOptions };

const PROTECTED_PREFIXES = ["/dashboard", "/admin"];
const ADMIN_PREFIX = "/admin";
const AUTH_ONLY_PATHS = ["/login", "/register"];

/**
 * Refreshes the Supabase session cookie on every request and redirects
 * unauthenticated requests away from protected routes before they render.
 * `RequireAuth` (src/components/auth/require-auth.tsx) is a UX layer on top
 * of this, not a replacement for it -- this is the real security boundary.
 *
 * Uses `getUser()` to authenticate sessions and validate tokens securely
 * with cookie synchronization across serverless and edge runtimes.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isProtected = PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
  const isAuthOnlyPage = AUTH_ONLY_PATHS.includes(pathname);

  // Redirects carry the session-refresh cookies set above onto the new
  // response -- returning a bare `NextResponse.redirect(...)` here would
  // silently drop a just-refreshed access/refresh token pair, which is its
  // own source of "logged in a second ago, logged out now" flakiness.
  const redirectWithFreshCookies = (url: URL) => {
    const redirect = NextResponse.redirect(url);
    response.cookies.getAll().forEach((cookie) => redirect.cookies.set(cookie));
    return redirect;
  };

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", pathname);
    return redirectWithFreshCookies(loginUrl);
  }

  if (user && (isAuthOnlyPage || pathname.startsWith(ADMIN_PREFIX))) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();
    const isAdmin = profile?.role === "admin";

    if (isAuthOnlyPage) {
      return redirectWithFreshCookies(new URL(isAdmin ? "/admin" : "/dashboard", request.url));
    }
    if (pathname.startsWith(ADMIN_PREFIX) && !isAdmin) {
      return redirectWithFreshCookies(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for static assets and image
     * optimization files, so the session cookie stays fresh everywhere.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
