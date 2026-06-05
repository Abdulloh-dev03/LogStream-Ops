import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protected routes require authentication
const protectedRoutes = ['/dashboard/settings', '/dashboard/billing']

export function proxy(request: NextRequest) {
  // Check for the "token" cookie
  const token = request.cookies.get('token')?.value
  
  const isGuest = !token
  const isProtectedRoute = protectedRoutes.some(route => request.nextUrl.pathname.startsWith(route))

  if (isGuest && isProtectedRoute) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  // Pass an internal header to let pages know if the user is a guest (prevents hydration flicker)
  const response = NextResponse.next()
  response.headers.set('x-is-guest', isGuest ? 'true' : 'false')

  return response
}

export const config = {
  // Match all routes except api, static files, and images
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
