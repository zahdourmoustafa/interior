'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';

export function AuthClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent the provider from rendering on the server and during the initial client render.
  // This avoids hydration mismatches.
  if (!mounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}
