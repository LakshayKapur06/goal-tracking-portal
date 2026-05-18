import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAuthPage = req.nextUrl.pathname.startsWith('/login')
  const isApiAuthRoute = req.nextUrl.pathname.startsWith('/api/auth')

  if (isApiAuthRoute) return NextResponse.next()

  if (isAuthPage) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    return NextResponse.next()
  }

  if (!isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  // Role-based protection
  const role = req.auth?.user?.role

  if (req.nextUrl.pathname.startsWith('/goals/create') && role !== 'EMPLOYEE') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  if (req.nextUrl.pathname.startsWith('/goals/review') && role !== 'MANAGER') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  
  if (req.nextUrl.pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}
