'use client';

import { Home, Palette, Image, Video, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Redecorate Room', href: '/dashboard/redecorate-room', icon: Palette },
  { name: 'Sketch to Reality', href: '/dashboard/sketch-to-reality', icon: Image },
  { name: 'Generate Videos', href: '/dashboard/generate-videos', icon: Video },
  { name: 'Saved Videos', href: '/dashboard/saved-videos', icon: Video },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("w-full md:w-64 bg-card border-r flex flex-col h-full", className)}>
      <div className="p-6">
        <h1 className="text-xl font-bold text-foreground">InteriorAI Pro</h1>
      </div>
      
      <nav className="flex-1 px-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t mt-auto">
        <p className="text-xs text-muted-foreground">
          © 2024 InteriorAI Pro
        </p>
      </div>
    </div>
  );
}