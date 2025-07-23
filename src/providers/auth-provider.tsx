'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Only render the auth provider on the client side to avoid hydration issues
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
