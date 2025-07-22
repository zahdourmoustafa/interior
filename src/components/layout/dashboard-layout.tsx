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
    <div className="flex h-screen bg-[#F8F8FA]">
      {!isMobile && <Sidebar className="border-r border-[#EAECEF]" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto">
          {useContainer ? (
            <div className="container mx-auto px-6 py-6 max-w-[1400px]">
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