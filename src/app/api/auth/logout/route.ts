import { auth } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    // Use Better Auth to handle logout
    await auth.api.signOut({
      headers: request.headers,
    });

    // Create a response that clears cookies and redirects
    const nextResponse = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { status: 200 }
    );

    // Clear authentication cookies
    nextResponse.cookies.delete('better-auth.session_token');
    nextResponse.cookies.delete('better-auth.csrf_token');
    
    // Set additional security headers
    nextResponse.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    nextResponse.headers.set('Pragma', 'no-cache');
    nextResponse.headers.set('Expires', '0');

    return nextResponse;
  } catch (error) {
    console.error('Logout API error:', error);
    
    // Even if there's an error, clear cookies and return success
    const nextResponse = NextResponse.json(
      { success: true, message: 'Logged out' },
      { status: 200 }
    );

    nextResponse.cookies.delete('better-auth.session_token');
    nextResponse.cookies.delete('better-auth.csrf_token');
    
    return nextResponse;
  }
}

// Handle GET requests as well (fallback)
export async function GET(request: NextRequest) {
  return POST(request);
}
