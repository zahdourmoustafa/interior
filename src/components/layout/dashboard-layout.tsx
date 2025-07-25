'use client';

import { ReactNode, useEffect } from 'react';
import { Sidebar } from './sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { authClient } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface DashboardLayoutProps {
  children: ReactNode;
  useContainer?: boolean;
}

export function DashboardLayout({ children, useContainer = true }: DashboardLayoutProps) {
  const isMobile = useIsMobile();
  const router = useRouter();
  const session = authClient.useSession();

  useEffect(() => {
    if (!session.isPending && !session.data?.user) {
      router.push('/sign-in');
    }
  }, [session, router]);

  return (
    <div className="flex h-screen bg-[#F8F8FA]">
      {!isMobile && <Sidebar className="border-r border-[#EAECEF]" />}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto overflow-x-hidden hide-scrollbar">
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