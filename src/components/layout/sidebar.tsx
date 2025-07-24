'use client';

import { useState, useEffect } from 'react';
import { Home, ChevronRight, Image, Video, Scissors, Brush, Wallpaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserProfile } from './user-profile';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Interior', href: '/dashboard/redecorate-room', icon: Wallpaper },
  { name: 'Exterior', href: '/dashboard/redesign-exterior', icon: Home },
  { name: 'Sketch', href: '/dashboard/sketch-to-reality', icon: Brush },
  { name: 'Furnish Empty Space', href: '/dashboard/furnish-empty-space', icon: Image },
  { name: 'Remove Object', href: '/dashboard/remove-object', icon: Scissors },
  { name: 'Generate Video', href: '/dashboard/generate-videos', icon: Video },

];

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-collapse sidebar after navigation on mobile
  useEffect(() => {
    setIsExpanded(false);
  }, [pathname]);

  return (
    <div 
      className={cn(
        "bg-white flex flex-col h-full transition-all duration-300 ease-in-out relative z-20",
        isExpanded || isHovering ? "w-64" : "w-16",
        className
      )}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      {/* Logo/Brand Section */}
      <div className="p-6">
        <div className="flex items-center">
          <h1 className="text-2xl font-bold text-black whitespace-nowrap">arch</h1>
        </div>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-3 py-4">
        <ul className="space-y-1">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                  pathname === item.href
                    ? "bg-[#3b82f6]/10 text-[#3b82f6]"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  pathname === item.href ? "text-[#3b82f6]" : "text-gray-500"
                )} />
                <span className={cn(
                  "ml-3 transition-opacity duration-300",
                  isExpanded || isHovering ? "opacity-100" : "opacity-0 w-0 overflow-hidden"
                )}>
                  {item.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Theme Toggle */}
      <div className={cn(
        "px-4 py-3 mb-6 transition-opacity duration-300",
        isExpanded || isHovering ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex items-center">
          <span className="text-sm text-gray-600 mr-3">Theme</span>
          <div className="w-12 h-6 bg-[#3b82f6] rounded-full relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 mt-auto border-t border-gray-200">
        {/* User Profile - Only visible when expanded */}
        <div className={cn(
          "transition-opacity duration-300",
          isExpanded || isHovering ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        )}>
          <UserProfile />
        </div>
        
        {/* Collapsed Avatar - Only visible when collapsed */}
        {!isExpanded && !isHovering && (
          <div className="flex justify-center">
            <UserProfile />
          </div>
        )}
      </div>
      
      {/* Expand/Collapse Toggle */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          "absolute -right-3 top-20 bg-white border border-gray-200 rounded-full p-1 shadow-sm",
          "hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        )}
      >
        <ChevronRight className={cn(
          "h-4 w-4 text-gray-500 transition-transform duration-300",
          isExpanded || isHovering ? "rotate-180" : "rotate-0"
        )} />
      </button>
    </div>
  );
}