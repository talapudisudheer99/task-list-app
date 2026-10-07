import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

/**
 * Runs before each matched request.
 * 1. Refresh the auth session cookies if needed.
 * 2. Send signed-out users away from /tasks.
 * 3. Send signed-in users away from /login.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // getClaims() verifies the JWT and refreshes it when it is close to expiry.
  const { data } = await supabase.auth.getClaims();
  const isSignedIn = Boolean(data?.claims);

  const path = request.nextUrl.pathname;

  if (!isSignedIn && path.startsWith("/tasks")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    return NextResponse.redirect(loginUrl);
  }

  if (isSignedIn && path.startsWith("/login")) {
    const tasksUrl = request.nextUrl.clone();
    tasksUrl.pathname = "/tasks";
    return NextResponse.redirect(tasksUrl);
  }

  return response;
}

export const config = {
  // Skip Next.js internals, image optimization, and static image files.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
