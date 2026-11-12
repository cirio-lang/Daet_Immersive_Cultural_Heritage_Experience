import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase credentials are not yet configured in .env.local, allow request to proceed
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        supabaseResponse = NextResponse.next({
          request,
        });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  // IMPORTANT: Use getUser() instead of getSession() for secure server-side validation
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // 0. Disable public registration - redirect any register route to login
  if (pathname.includes("/register")) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth/v2/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  // 1. Protected Admin Dashboard Routes (/dashboard/*)
  if (pathname.startsWith("/dashboard")) {
    // If not authenticated, redirect to login page with return URL
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/auth/v2/login";
      url.searchParams.set("redirectedFrom", pathname);
      return NextResponse.redirect(url);
    }

    // Check if authenticated user has 'admin' role
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/unauthorized";
      return NextResponse.redirect(url);
    }
  }

  // 2. Auth routes: redirect already authenticated admins directly to dashboard
  if (pathname.startsWith("/auth") && user) {
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

    if (profile?.role === "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
