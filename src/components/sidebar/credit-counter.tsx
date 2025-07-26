'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Zap, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CreditCounterProps {
  isExpanded: boolean;
  credits: {
    remaining: number;
    total: number;
    unlimited: boolean;
    subscriptionStatus: string;
  } | null;
  loading?: boolean;
  onUpgradeClick: () => void;
}

export function CreditCounter({ 
  isExpanded, 
  credits, 
  loading = false, 
  onUpgradeClick 
}: CreditCounterProps) {
  const [isHovering, setIsHovering] = useState(false);

  // Show loading state
  if (loading || !credits) {
    return (
      <div className="flex items-center justify-center">
        <div className="w-11 h-11 rounded-xl bg-gray-100 animate-pulse flex items-center justify-center">
          <div className="w-5 h-5 rounded-full bg-gray-300 animate-pulse"></div>
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

  // Show unlimited status for paid users
  if (credits.unlimited) {
    return (
      <div className="flex items-center">
        <div className="relative flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-yellow-500 to-orange-600 p-0.5 shadow-lg">
            <div className="w-full h-full rounded-xl bg-white flex items-center justify-center">
              <Crown className="w-5 h-5 text-yellow-600" />
            </div>
          </div>
          {/* Premium indicator */}
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-yellow-500 border-2 border-white rounded-full"></div>
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
              <p className="text-sm font-medium text-gray-900">
                Unlimited
              </p>
              <p className="text-xs text-yellow-600 font-medium">
                {credits.subscriptionStatus.charAt(0).toUpperCase() + credits.subscriptionStatus.slice(1)} Plan
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Calculate credit status
  const isLow = credits.remaining <= 2;
  const isEmpty = credits.remaining === 0;
  const percentage = (credits.remaining / credits.total) * 100;

  return (
    <div 
      className="flex items-center cursor-pointer"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onClick={isExpanded && isLow ? onUpgradeClick : undefined}
    >
      {/* Credit Icon with Progress Ring */}
      <div className="relative flex-shrink-0">
        <div className={cn(
          "w-11 h-11 rounded-xl p-0.5 shadow-lg transition-all duration-300",
          isEmpty 
            ? "bg-gradient-to-br from-red-500 to-red-600" 
            : isLow 
              ? "bg-gradient-to-br from-orange-500 to-yellow-600"
              : "bg-gradient-to-br from-blue-500 to-purple-600"
        )}>
          <div className="w-full h-full rounded-xl bg-white flex items-center justify-center relative overflow-hidden">
            <Zap className={cn(
              "w-5 h-5 transition-colors duration-300",
              isEmpty ? "text-red-600" : isLow ? "text-orange-600" : "text-blue-600"
            )} />
            
            {/* Progress ring background */}
            <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="2"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke={isEmpty ? "#dc2626" : isLow ? "#ea580c" : "#2563eb"}
                strokeWidth="2"
                strokeDasharray={`${percentage}, 100`}
                className="transition-all duration-500"
              />
            </svg>
          </div>
        </div>
        
        {/* Credit count badge */}
        <div className={cn(
          "absolute -bottom-1 -right-1 min-w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold text-white border-2 border-white shadow-sm",
          isEmpty ? "bg-red-500" : isLow ? "bg-orange-500" : "bg-blue-500"
        )}>
          {credits.remaining}
        </div>
      </div>

      {/* Expanded Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className="ml-3 flex-1 min-w-0"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {credits.remaining}/{credits.total} credits
                </p>
                <p className={cn(
                  "text-xs font-medium",
                  isEmpty ? "text-red-600" : isLow ? "text-orange-600" : "text-gray-500"
                )}>
                  {isEmpty 
                    ? "No credits remaining" 
                    : isLow 
                      ? "Running low" 
                      : "Available"
                  }
                </p>
              </div>
              
              {/* Upgrade button for low/empty credits */}
              {(isLow || isEmpty) && (
                <motion.button
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpgradeClick();
                  }}
                  className={cn(
                    "flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200",
                    "hover:scale-105 active:scale-95",
                    isEmpty 
                      ? "bg-red-100 text-red-700 hover:bg-red-200" 
                      : "bg-orange-100 text-orange-700 hover:bg-orange-200"
                  )}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span>Upgrade</span>
                  <ArrowRight className="w-3 h-3" />
                </motion.button>
              )}
            </div>
            
            {/* Progress bar */}
            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
              <motion.div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  isEmpty ? "bg-red-500" : isLow ? "bg-orange-500" : "bg-blue-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
