
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Protect admin routes (exclude login page)
  if (
    pathname.startsWith('/admin') &&
    !pathname.startsWith('/admin/login')
  ) {
    const authCookie = request.cookies.get('admin-auth')

    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.redirect(
        new URL('/admin/login', request.url)
      )
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*'],
}
