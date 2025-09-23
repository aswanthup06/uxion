import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Redirect from root to /home
  if (request.nextUrl.pathname === '/') {
    return NextResponse.redirect(new URL('/home', request.url))
  }

  // Protect admin routes (exclude login page)
  if (request.nextUrl.pathname.startsWith('/admin') && 
      !request.nextUrl.pathname.includes('/login')) {
    const authCookie = request.cookies.get('admin-auth')
    
    // If not authenticated, redirect to admin login
    if (!authCookie || authCookie.value !== 'true') {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: ['/', '/admin/:path*']
}