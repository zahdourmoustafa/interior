import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes
  const protectedRoutes = ['/dashboard'];
  const publicRoutes = ['/sign-in', '/', '/terms', '/privacy'];

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if the current path is a public route
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route)
  );

  try {
    // Get session from the request
    const session = await auth.api.getSession({
      headers: request.headers
    });

    // If accessing a protected route without a session, redirect to sign-in
    if (isProtectedRoute && !session) {
      const signInUrl = new URL('/sign-in', request.url);
      // Add a redirect parameter to return to the original page after login
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // If accessing sign-in page while already authenticated, redirect to dashboard
    if (pathname === '/sign-in' && session) {
      const redirectUrl = request.nextUrl.searchParams.get('redirect') || '/dashboard';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }

    // If accessing root while authenticated, redirect to dashboard
    if (pathname === '/' && session) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    console.error('Middleware auth error:', error);
    
    // If there's an auth error and trying to access protected route, redirect to sign-in
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/sign-in', request.url));
    }
  }

  // Allow the request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
