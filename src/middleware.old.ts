import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refresh_token');
  const isAuthPage = request.nextUrl.pathname.startsWith('/login');

  // 1. If trying to access dashboard without a refresh token -> Redirect to login
  if (!refreshToken && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 2. If already logged in and trying to access login page -> Redirect to dashboard
  if (refreshToken && isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

// Only run middleware on dashboard and login routes
export const config = {
  matcher: ['/dashboard/:path*', '/login', '/lab/:path*', '/admin/:path*', '/document/:path*'],
};