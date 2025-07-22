'use client';

import { useState, useEffect } from 'react';
import { Home, CreditCard, FileCode, Settings, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Pricing', href: '/dashboard/pricing', icon: CreditCard },
  { name: 'API', href: '/dashboard/api', icon: FileCode },
  { name: 'Theme', href: '/dashboard/theme', icon: Settings },
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
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn(
                  "h-5 w-5 flex-shrink-0",
                  pathname === item.href ? "text-blue-600" : "text-gray-500"
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
          <div className="w-12 h-6 bg-blue-600 rounded-full relative">
            <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 mt-auto">
        {/* Sign In Button - Only visible when expanded */}
        <div className={cn(
          "flex items-center space-x-2 mb-4 transition-opacity duration-300",
          isExpanded || isHovering ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        )}>
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
              U
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-600">Sign in</span>
          <div className="ml-auto flex items-center justify-center w-6 h-6 bg-gray-100 rounded-full">
            <span className="text-xs text-blue-600 font-medium">1</span>
          </div>
        </div>
        
        {/* Unlimited Access - Only visible when expanded */}
        <div className={cn(
          "bg-gray-50 rounded-lg p-3 transition-opacity duration-300",
          isExpanded || isHovering ? "opacity-100" : "opacity-0 h-0 overflow-hidden"
        )}>
          <p className="text-sm font-medium text-gray-800">Unlimited Access</p>
          <p className="text-xs text-gray-600 mt-1">
            Upgrade for better generations and more beautiful
          </p>
          <Button className="mt-3 w-full bg-white text-gray-800 border border-gray-200 hover:bg-gray-50 text-xs h-8 rounded-lg">
            Get Pro
          </Button>
        </div>
        
        {/* Collapsed Avatar - Only visible when collapsed */}
        {!isExpanded && !isHovering && (
          <div className="flex justify-center">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-gray-200 text-gray-600 text-xs">
                U
              </AvatarFallback>
            </Avatar>
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