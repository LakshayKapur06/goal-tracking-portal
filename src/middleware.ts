import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Public routes that don't require authentication
  const publicRoutes = ["/login", "/api/auth"]
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Check for the session token cookie (set by NextAuth)
  const sessionToken =
    request.cookies.get("__Secure-next-auth.session-token") ||
    request.cookies.get("next-auth.session-token")

  if (!sessionToken && !isPublicRoute) {
    const loginUrl = new URL("/login", request.nextUrl.origin)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect logged-in users away from login page
  if (sessionToken && pathname === "/login") {
    return NextResponse.redirect(new URL("/dashboard", request.nextUrl.origin))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
