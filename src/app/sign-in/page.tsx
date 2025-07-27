'use client';

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { authClient } from '@/lib/auth-client';

function SignInContent() {
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Ensure we're on the client side
    setIsClient(true);
  }, []);

  const handleGoogleSignIn = async () => {
    if (!isClient) {
      console.error('Not on client side');
      return;
    }

    setIsLoading(true);
    try {
      // Get redirect parameter or default to dashboard
      const redirectTo = searchParams.get('redirect') || '/dashboard';
      // Check if signIn.social exists
      if (authClient.signIn?.social) {
        await authClient.signIn.social({
          provider: 'google',
          callbackURL: redirectTo,
        });
      } else {
        console.warn('Social sign-in not available, using fallback');
        // Use the correct better-auth endpoint with redirect
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        window.location.href = `${baseUrl}/api/auth/google?redirect=${encodeURIComponent(redirectTo)}`;
      }
    } catch (error) {
      console.error('Google sign in error:', error);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-white flex flex-col">
      {/* Header with logo and login button */}
      <header className="w-full py-4 px-6 flex justify-between items-center">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <span className="ml-2 text-2xl font-bold text-blue-600">ArchiCassoAI</span>
        </div>
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white px-8"
          onClick={handleGoogleSignIn}
          disabled={isLoading || !isClient}
        >
          Login
        </Button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* User count badge */}
        <div className="mb-8 bg-white rounded-full px-6 py-2 shadow-sm border border-gray-100">
          <p className="text-gray-700">
            Over <span className="text-blue-500 font-medium">10,000 users</span> have used ArchiCassoAI so far
          </p>
        </div>

        {/* Main headline */}
        <h1 className="text-5xl md:text-6xl font-bold text-gray-800 mb-6 max-w-3xl">
          Redesign your <span className="text-blue-500">interior</span>
          <br />in seconds
        </h1>

        {/* Value proposition */}
        <p className="text-lg text-gray-700 mb-8 max-w-2xl">
          Sign in below with Google to create a free account
          <br />and redesign your interior today. You will get <span className="font-semibold">1 generation</span> for free.
        </p>

        {/* Google sign-in button */}
        <Button 
          className="h-14 text-base bg-white hover:bg-gray-50 text-gray-800 px-8 flex items-center gap-3 rounded-full shadow-sm border border-gray-200"
          onClick={handleGoogleSignIn}
          disabled={isLoading || !isClient}
        >
          <Image 
            src="/google-color.svg" 
            alt="Google" 
            width={20} 
            height={20} 
            className="object-contain" 
          />
          Sign in with Google
        </Button>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center">
        <p className="text-sm text-gray-500">
          By signing in, you agree to our{' '}
          <a href="/terms" className="underline hover:text-blue-500">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="/privacy" className="underline hover:text-blue-500">
            Privacy Policy
          </a>
        </p>
      </footer>
    </div>
  );
}
export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}
