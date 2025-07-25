"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useEffect, useState } from "react";
import { Icons } from "@/components/icons";

interface NavigationLink {
  label: string;
  href?: string;
  targetId?: string;
  onClick?: () => void;
}

interface NavigationCTA {
  label: string;
  href?: string;
  targetId?: string;
  onClick?: () => void;
  variant?: "default" | "outline";
}

interface GlassNavigationProps {
  links: NavigationLink[];
  cta?: NavigationCTA;
  className?: string;
  position?: "top" | "bottom" | "center";
  glassIntensity?: "light" | "medium" | "heavy";
  animationDelay?: number;
  enableHover?: boolean;
  showLogo?: boolean;
}

const glassStyles = {
  light: {
    background: "rgba(255, 255, 255, 0.98)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    blur: "blur(8px)",
    shadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  },
  medium: {
    background: "rgba(255, 255, 255, 0.98)",
    border: "1px solid rgba(0, 0, 0, 0.08)",
    blur: "blur(12px)",
    shadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  },
  heavy: {
    background: "rgba(255, 255, 255, 1)",
    border: "1px solid rgba(0, 0, 0, 0.1)",
    blur: "blur(16px)",
    shadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  },
};

const positionStyles = {
  top: "fixed top-6 left-1/2 -translate-x-1/2",
  bottom: "fixed bottom-6 left-1/2 -translate-x-1/2",
  center: "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
};

export default function GlassNavigation({
  links,
  cta,
  className = "",
  position = "top",
  glassIntensity = "medium",
  animationDelay = 0.3,
  enableHover = true,
  showLogo = true,
}: GlassNavigationProps) {
  const [scrolled, setScrolled] = useState(false);
  const glass = glassStyles[glassIntensity];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleNavigation = (item: NavigationLink | NavigationCTA) => {
    if (item.onClick) {
      item.onClick();
    } else if (item.targetId) {
      const element = document.getElementById(item.targetId);
      if (element) {
        element.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }
    } else if (item.href) {
      window.location.href = item.href;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: position === "bottom" ? 20 : -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.6, 
        delay: animationDelay,
        type: "spring",
        stiffness: 100,
        damping: 30
      }}
      className={`${positionStyles[position]} z-50 transform-gpu ${className}`}
    >
      <motion.div
        className={cn(
          "relative overflow-hidden transition-all duration-700 px-4 py-2 md:px-6 md:py-3",
          enableHover ? "hover:scale-105" : "",
          scrolled ? "rounded-full" : "rounded-2xl"
        )}
                 style={{
           backdropFilter: glass.blur,
           WebkitBackdropFilter: glass.blur,
           background: scrolled ? "rgba(255, 255, 255, 0.98)" : glass.background,
           border: glass.border,
           boxShadow: scrolled ? "0 4px 20px rgba(0, 0, 0, 0.15)" : glass.shadow,
         }}
        whileHover={enableHover ? { scale: 1.02 } : undefined}
        transition={{ duration: 0.3 }}
      >
                 {/* Glass overlay effects */}
         <div
           className="absolute inset-0 rounded-full"
           style={{
             background: "rgba(255, 255, 255, 0.1)",
             boxShadow:
               "inset 1px 1px 2px rgba(255, 255, 255, 0.8), inset -1px -1px 2px rgba(0, 0, 0, 0.05)",
           }}
         />

        {/* Content */}
        <div className="relative z-10 flex items-center space-x-3 md:space-x-6">
          {/* Logo */}
          {showLogo && (
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: animationDelay + 0.1 }}
            >
              <Icons.logo className="w-8 h-8 md:w-12 md:h-12 text-[#3b82f6]" />
            </motion.div>
          )}

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((link, index) => (
              <motion.button
                key={index}
                                 className="text-gray-600 hover:text-[#3b82f6] transition-all duration-300 text-sm font-medium px-4 py-2 whitespace-nowrap hover:bg-gray-100/50 rounded-full relative group"
                onClick={() => handleNavigation(link)}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: animationDelay + 0.2 + index * 0.1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {link.label}
                                   <div className="absolute inset-0 bg-[#3b82f6]/10 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </motion.button>
            ))}
          </div>

          {/* CTA Button */}
          {cta && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: animationDelay + 0.4 }}
            >
                               <Button
                   className={cn(
                     "transition-all duration-300 whitespace-nowrap relative overflow-hidden group rounded-full",
                     cta.variant === "outline"
                       ? "bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50 hover:border-gray-400"
                       : "bg-[#3b82f6] hover:bg-[#2563eb] text-white border-0 shadow-sm hover:shadow-md"
                   )}
                   size="sm"
                   onClick={() => handleNavigation(cta)}
                 >
                   <span className="relative z-10">{cta.label}</span>
                 </Button>
            </motion.div>
          )}
        </div>

                 {/* Subtle animated border */}
         <div className="absolute inset-0 rounded-full opacity-30">
           <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3b82f6]/10 via-transparent to-[#3b82f6]/10 animate-pulse" />
         </div>
      </motion.div>
    </motion.div>
  );
}

// Preset for ArchiCassoAI
export const interiorAIPreset = {
  links: [
    { label: "AI Tools", targetId: "ai-tools" },
    { label: "Features", targetId: "features" },
    { label: "How it Works", targetId: "how-it-works" },
    { label: "Pricing", targetId: "pricing" },
  ],
  cta: { 
    label: "Start Designing", 
    href: "/dashboard",
    variant: "default" as const
  },
}; 