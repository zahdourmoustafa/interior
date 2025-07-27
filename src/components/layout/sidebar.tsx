'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Home, 
  Image as ImageIcon, 
  Video, 
  Scissors, 
  Brush, 
  Wallpaper,
  Type,
  Crown,
  Menu,
  X,
  Settings,
  HelpCircle,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from "@/components/icons";
import { authClient } from '@/lib/auth-client';
import { toast } from 'sonner';
import { useCredits } from '@/providers/credit-provider';
import { CreditCounter } from '@/components/sidebar/credit-counter';
import { UpgradeModal } from '@/components/modals/upgrade-modal';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'from-blue-500 to-blue-600' },
  { name: 'Interior', href: '/dashboard/redecorate-room', icon: Wallpaper, color: 'from-purple-500 to-purple-600' },
  { name: 'Exterior', href: '/dashboard/redesign-exterior', icon: Home, color: 'from-green-500 to-green-600' },
  { name: 'Text to Design', href: '/dashboard/text-to-design', icon: Type, color: 'from-cyan-500 to-cyan-600' },
  { name: 'Sketch', href: '/dashboard/sketch-to-reality', icon: Brush, color: 'from-orange-500 to-orange-600' },
  { name: 'Furnish Empty Space', href: '/dashboard/furnish-empty-space', icon: ImageIcon, color: 'from-pink-500 to-pink-600' },
  { name: 'Remove Object', href: '/dashboard/remove-object', icon: Scissors, color: 'from-red-500 to-red-600' },
  { name: 'Generate Video', href: '/dashboard/generate-videos', icon: Video, color: 'from-indigo-500 to-indigo-600' },
];

const bottomNavigation = [
  { name: 'Plans', href: '/dashboard/plans', icon: Crown },
  { name: 'Settings', href: '/dashboard/settings', icon: Settings },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
];

interface SidebarProps {
  className?: string;
}

// Credit Counter Sidebar Component
const CreditCounterSidebar = ({ isExpanded }: { isExpanded: boolean }) => {
  const { credits, loading } = useCredits();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  
  const handleUpgradeClick = () => {
    setIsUpgradeModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsUpgradeModalOpen(false);
  };

  const handleUpgrade = () => {
    // The UpgradeModal component handles the upgrade process internally
    // We just need to close the modal after the process starts
    setIsUpgradeModalOpen(false);
  };

  return (
    <>
      <CreditCounter
        isExpanded={isExpanded}
        credits={credits}
        loading={loading}
        onUpgradeClick={handleUpgradeClick}
      />
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={handleCloseModal}
        onUpgrade={handleUpgrade}
        remainingCredits={credits?.remaining || 0}
      />
    </>
  );
};

// User Profile Sidebar Component
const UserProfileSidebar = ({ isExpanded }: { isExpanded: boolean }) => {
  const session = authClient.useSession();
  const user = session.data?.user;

  if (session.isPending) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-6 h-6 rounded-full bg-gray-300 animate-pulse"></div>
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="ml-3 flex-1 min-w-0"
            >
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-1"></div>
              <div className="h-3 bg-gray-200 rounded animate-pulse w-3/4"></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-11 h-11 rounded-xl bg-gray-100 flex items-center justify-center">
          <Home className="w-6 h-6 text-gray-400" />
        </div>
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2, delay: 0.1 }}
              className="ml-3"
            >
              <p className="text-sm text-gray-500">Not signed in</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="flex items-center">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 p-0.5 shadow-lg">
          <div className="w-full h-full rounded-xl bg-white flex items-center justify-center overflow-hidden">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name || 'User'}
                width={40}
                height={40}
                className="w-full h-full object-cover rounded-xl"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
            )}
          </div>
        </div>
        
        {/* Online indicator */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
      </div>

      {/* User Info - Only show when expanded */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="ml-3 flex-1 min-w-0"
          >
            <p className="text-sm font-medium text-gray-900 truncate">
              {user.name || 'User'}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {user.email}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const [isHovering, setIsHovering] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const isExpanded = isHovering;

  // Proper logout handler using Better Auth
  const handleLogout = async () => {
    if (isLoggingOut) return; // Prevent multiple logout attempts
    
    setIsLoggingOut(true);
    
    try {
      // Show loading toast
      toast.loading('Signing out...', { id: 'logout' });
      
      // Method 1: Use Better Auth client to sign out
      await authClient.signOut({
        fetchOptions: {
          onSuccess: async () => {
            try {
              // Method 2: Also call our custom logout API for extra cleanup
              await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
              });
            } catch (apiError) {
              console.warn('Custom logout API failed:', apiError);
              // Continue anyway, Better Auth logout was successful
            }
            
            // Clear any additional client-side data
            localStorage.clear();
            sessionStorage.clear();
            
            // Success toast
            toast.success('Signed out successfully', { id: 'logout' });
            
            // Small delay to show success message
            setTimeout(() => {
              // Force a complete page reload to clear all cached data
              window.location.href = '/sign-in';
            }, 500);
          },
          onError: async (error) => {
            console.error('Better Auth logout error:', error);
            
            // Fallback: try custom API route
            try {
              await fetch('/api/auth/logout', {
                method: 'POST',
                credentials: 'include',
              });
              
              // Clear client-side data
              localStorage.clear();
              sessionStorage.clear();
              
              toast.success('Signed out successfully', { id: 'logout' });
              
              setTimeout(() => {
                window.location.href = '/sign-in';
              }, 500);
              
            } catch (fallbackError) {
              console.error('Fallback logout failed:', fallbackError);
              toast.error('Error signing out. Please try again.', { id: 'logout' });
              setIsLoggingOut(false);
            }
          }
        }
      });
    } catch (error) {
      console.error('Complete logout error:', error);
      
      // Final fallback: force logout anyway
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
        });
      } catch (e) {
        console.warn('Final fallback failed:', e);
      }
      
      // Clear everything and redirect
      localStorage.clear();
      sessionStorage.clear();
      
      toast.error('Logout completed with errors', { id: 'logout' });
      
      setTimeout(() => {
        window.location.href = '/sign-in';
      }, 1000);
    } finally {
      setIsLoggingOut(false);
    }
  };

  // Auto-close mobile sidebar after navigation
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Close mobile sidebar on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMobileOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileOpen]);

  // Mobile Toggle Button
  const MobileToggle = () => (
    <button
      onClick={() => setIsMobileOpen(!isMobileOpen)}
      className="fixed top-4 left-4 z-50 md:hidden bg-white/90 backdrop-blur-md border border-gray-200/50 rounded-xl p-3 shadow-lg"
    >
      {isMobileOpen ? <X className="h-5 w-5 flex-shrink-0" /> : <Menu className="h-5 w-5 flex-shrink-0" />}
    </button>
  );

  // Navigation Item Component
  const NavItem = ({ item, index }: { item: typeof navigation[0]; index: number }) => {
    const isActive = pathname === item.href;
    
    return (
      <motion.li
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
      >
        <Link
          href={item.href}
          className="group relative flex items-center px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-300 overflow-hidden min-h-[56px]"
        >
          {/* Icon with gradient background */}
          <div className={cn(
            "relative flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 flex-shrink-0",
            isActive 
              ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}>
            <item.icon className="h-5 w-5 flex-shrink-0" style={{ display: 'block' }} />
          </div>
          
          {/* Text - only show when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.span
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2, delay: 0.1 }}
                className={cn(
                  "ml-3 font-medium truncate whitespace-nowrap",
                  isActive ? "text-gray-900" : "text-gray-600"
                )}
              >
                {item.name}
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </motion.li>
    );
  };

  // Desktop Sidebar
  const DesktopSidebar = () => (
    <div className="hidden md:block relative">
      {/* Base sidebar that takes space in layout - always 80px */}
      <div className="w-20 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-lg">
        {/* This creates the constant space in the page layout */}
      </div>
      
      {/* Actual sidebar content - overlays when expanded */}
      <motion.div
        className={cn(
          "absolute left-0 top-0 h-full bg-white/95 backdrop-blur-xl border-r border-gray-200/50 shadow-2xl z-50 flex flex-col",
          className
        )}
        animate={{
          width: isExpanded ? 320 : 80
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
          duration: 0.3
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-purple-50/50 -z-10" />
        
        {/* Logo Section */}
        <div className="px-3 py-4 border-b border-gray-200/50">
          <div className="flex items-center">
            <div className="flex items-center justify-center w-11 h-11 bg-gray-100 rounded-xl shadow-lg flex-shrink-0">
              <Icons.logo className="h-5 w-5 text-gray-700 flex-shrink-0" />
            </div>
            
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  className="ml-3 overflow-hidden"
                >
                  <h1 className="font-bold text-sm text-gray-900 whitespace-nowrap">
                    ArchiCassoAI
                  </h1>
                  <p className="text-xs text-gray-500 mt-0.5 whitespace-nowrap">Interior Design AI</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
        
        {/* Main Navigation */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto hide-scrollbar">
          <ul className="space-y-2">
            {navigation.map((item, index) => (
              <NavItem key={item.name} item={item} index={index} />
            ))}
          </ul>
          
          {/* Divider - only show when expanded */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="my-6 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                exit={{ opacity: 0, scaleX: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              />
            )}
          </AnimatePresence>
          
          {/* Bottom Navigation */}
          <ul className="space-y-2">
            {bottomNavigation.map((item, index) => (
              <motion.li
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: (navigation.length + index) * 0.05 }}
              >
                <Link
                  href={item.href}
                  className="group flex items-center px-3 py-3 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50/80 hover:text-gray-900 transition-all duration-300"
                >
                  <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 group-hover:bg-gray-200 transition-all duration-300 flex-shrink-0">
                    <item.icon className="h-5 w-5 flex-shrink-0" />
                  </div>
                  
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.span
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="ml-3 font-medium truncate whitespace-nowrap"
                      >
                        {item.name}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Link>
              </motion.li>
            ))}
            
            {/* Logout Button */}
            <motion.li
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: (navigation.length + bottomNavigation.length) * 0.05 }}
            >
              <button
                onClick={handleLogout}
                disabled={isLoggingOut}
                className={cn(
                  "group flex items-center w-full px-3 py-3 rounded-2xl text-sm font-medium transition-all duration-300",
                  isLoggingOut 
                    ? "text-gray-400 cursor-not-allowed" 
                    : "text-gray-600 hover:bg-red-50/80 hover:text-red-600"
                )}
              >
                <div className={cn(
                  "flex items-center justify-center w-11 h-11 rounded-xl transition-all duration-300 flex-shrink-0",
                  isLoggingOut 
                    ? "bg-gray-100" 
                    : "bg-gray-100 group-hover:bg-red-100"
                )}>
                  {isLoggingOut ? (
                    <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5 flex-shrink-0" />
                  )}
                </div>
                
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                      className="ml-3 font-medium truncate whitespace-nowrap"
                    >
                      {isLoggingOut ? 'Signing out...' : 'Logout'}
                    </motion.span>
                  )}
                </AnimatePresence>
              </button>
            </motion.li>
          </ul>
        </nav>
        
        {/* Credit Counter Section */}
        <div className="px-3 py-2 border-b border-gray-200/50">
          <CreditCounterSidebar isExpanded={isExpanded} />
        </div>

        {/* User Profile Section */}
        <div className="p-3 border-t border-gray-200/50">
          <UserProfileSidebar isExpanded={isExpanded} />
        </div>
      </motion.div>
    </div>
  );

  // Mobile Sidebar
  const MobileSidebar = () => (
    <>
      <MobileToggle />
      
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setIsMobileOpen(false)}
            />
            
            {/* Mobile Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30
              }}
              className="fixed left-0 top-0 bottom-0 w-80 bg-white/95 backdrop-blur-xl shadow-2xl z-50 md:hidden overflow-y-auto hide-scrollbar"
            >
              {/* Mobile Header */}
              <div className="p-6 border-b border-gray-200/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-2xl shadow-lg flex-shrink-0">
                      <Icons.logo className="h-7 w-7 text-gray-700 flex-shrink-0" />
                    </div>
                    <div className="ml-4">
                      <h1 className="font-bold text-xl text-gray-900">
                        ArchiCassoAI
                      </h1>
                      <p className="text-xs text-gray-500 mt-1">Interior Design AI</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-2 rounded-xl hover:bg-gray-100 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Mobile Navigation */}
              <nav className="flex-1 px-4 py-6">
                <ul className="space-y-2">
                  {navigation.map((item, index) => {
                    const isActive = pathname === item.href;
                    
                    return (
                      <motion.li
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <Link
                          href={item.href}
                          onClick={() => setIsMobileOpen(false)}
                          className={cn(
                            "group relative flex items-center px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300",
                            isActive
                              ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600"
                              : "text-gray-600 hover:bg-gray-50"
                          )}
                        >
                          <div className={cn(
                            "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 flex-shrink-0",
                            isActive 
                              ? `bg-gradient-to-br ${item.color} text-white shadow-lg` 
                              : "bg-gray-100"
                          )}>
                            <item.icon className="h-6 w-6 flex-shrink-0" />
                          </div>
                          
                          <span className="ml-4 font-medium">
                            {item.name}
                          </span>
                        </Link>
                      </motion.li>
                    );
                  })}
                </ul>
                
                <div className="my-8 h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent" />
                
                <ul className="space-y-2">
                  {bottomNavigation.map((item, index) => (
                    <motion.li
                      key={item.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: (navigation.length + index) * 0.1 }}
                    >
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className="flex items-center px-4 py-4 rounded-2xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all duration-300"
                      >
                        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0">
                          <item.icon className="h-6 w-6 flex-shrink-0" />
                        </div>
                        <span className="ml-4 font-medium">{item.name}</span>
                      </Link>
                    </motion.li>
                  ))}
                  
                  {/* Mobile Logout Button */}
                  <motion.li
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (navigation.length + bottomNavigation.length) * 0.1 }}
                  >
                    <button
                      onClick={() => {
                        setIsMobileOpen(false);
                        handleLogout();
                      }}
                      disabled={isLoggingOut}
                      className={cn(
                        "flex items-center w-full px-4 py-4 rounded-2xl text-sm font-medium transition-all duration-300",
                        isLoggingOut 
                          ? "text-gray-400 cursor-not-allowed" 
                          : "text-gray-600 hover:bg-red-50 hover:text-red-600"
                      )}
                    >
                      <div className={cn(
                        "flex items-center justify-center w-12 h-12 rounded-xl transition-all duration-300 flex-shrink-0",
                        isLoggingOut 
                          ? "bg-gray-100" 
                          : "bg-gray-100 hover:bg-red-100"
                      )}>
                        {isLoggingOut ? (
                          <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <LogOut className="h-6 w-6 flex-shrink-0" />
                        )}
                      </div>
                      <span className="ml-4 font-medium">
                        {isLoggingOut ? 'Signing out...' : 'Logout'}
                      </span>
                    </button>
                  </motion.li>
                </ul>
              </nav>
              
              {/* Mobile User Profile */}
              <div className="p-4 border-t border-gray-200/50">
                <UserProfileSidebar isExpanded={true} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
