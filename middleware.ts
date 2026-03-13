import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const session = request.cookies.get('admin_token')
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard')
  const isLoginPage = request.nextUrl.pathname === '/admin-123'

  if (isDashboard && !session?.value) {
    return NextResponse.redirect(new URL('/admin-123', request.url))
  }

  if (isLoginPage && session?.value) {
    return NextResponse.redirect(new URL('/dashboard/brands', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin-123'],
}
