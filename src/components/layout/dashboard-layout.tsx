'use client';

import { ReactNode } from 'react';
import { Sidebar } from './sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

interface DashboardLayoutProps {
  children: ReactNode;
  useContainer?: boolean;
}

export function DashboardLayout({ children, useContainer = true }: DashboardLayoutProps) {
  const isMobile = useIsMobile();

  return (
    <div className="flex h-screen bg-background">
      {!isMobile && <Sidebar />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {useContainer ? (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              {children}
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}