import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const key = new TextEncoder().encode(process.env.JWT_SECRET || 'your-secret-key-change-in-production')

// Routes that require authentication
const protectedRoutes = ['/dashboard']

// Routes that should redirect to dashboard if user is already authenticated
const authRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get the session token from cookies
  const sessionCookie = request.cookies.get('session')
  let isAuthenticated = false
  
  if (sessionCookie) {
    try {
      await jwtVerify(sessionCookie.value, key)
      isAuthenticated = true
    } catch (error) {
      // Token is invalid or expired
      isAuthenticated = false
    }
  }
  
  // Check if the current route is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // If trying to access protected route without authentication
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // If trying to access auth routes while already authenticated
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
