'use client';

import { useState } from 'react';
import { Home, Palette, Image, Video, Settings, ChevronRight } from 'lucide-react';
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
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div 
      className={cn(
        "bg-card border-r flex flex-col h-full transition-all duration-300 ease-in-out relative group",
        isExpanded ? "w-64" : "w-16",
        className
      )}
      onMouseEnter={() => setIsExpanded(true)}
      onMouseLeave={() => setIsExpanded(false)}
    >
      {/* Logo/Brand Section */}
      <div className="p-4 border-b">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
            <Home className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className={cn(
            "ml-3 transition-all duration-300",
            isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
          )}>
            <h1 className="text-lg font-bold text-foreground whitespace-nowrap">InteriorAI Pro</h1>
          </div>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-2">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group/item",
                  pathname === item.href
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                <span className={cn(
                  "ml-3 transition-all duration-300",
                  isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
                )}>
                  {item.name}
                </span>
                
                {/* Tooltip for collapsed state */}
                {!isExpanded && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/item:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.name}
                  </div>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Footer */}
      <div className="p-4 border-t mt-auto">
        <div className={cn(
          "transition-all duration-300",
          isExpanded ? "opacity-100" : "opacity-0"
        )}>
          <p className="text-xs text-muted-foreground whitespace-nowrap">
            © 2024 InteriorAI Pro
          </p>
        </div>
      </div>

      {/* Expand indicator */}
      <div className={cn(
        "absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2 w-6 h-6 bg-card border rounded-full flex items-center justify-center transition-all duration-300",
        isExpanded ? "opacity-0" : "opacity-100"
      )}>
        <ChevronRight className="h-3 w-3 text-muted-foreground" />
      </div>
    </div>
  );
}