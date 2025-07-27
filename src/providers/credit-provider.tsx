'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { FeatureType } from '@/lib/types/credit-types';
import { toast } from 'sonner';

interface UserCredits {
  remaining: number;
  total: number;
  subscriptionStatus: string;
  unlimited: boolean;
  lastUpdated: string;
  planName?: string;
}

interface CreditContextType {
  credits: UserCredits | null;
  loading: boolean;
  error: string | null;
  consumeCredit: (feature: FeatureType, generationId?: string, metadata?: Record<string, unknown>) => Promise<boolean>;
  refreshCredits: () => Promise<void>;
  checkCredits: () => Promise<boolean>;
  upgradeToSubscription: (planId: string, isYearly?: boolean) => Promise<string>;
}

const CreditContext = createContext<CreditContextType | undefined>(undefined);

interface CreditProviderProps {
  children: React.ReactNode;
}

export function CreditProvider({ children }: CreditProviderProps) {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user credits from API
  const fetchCredits = useCallback(async (): Promise<UserCredits | null> => {
    try {
      const response = await fetch('/api/user/credits', {
        credentials: 'include',
      });

      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated
          return null;
        }
        throw new Error(`Failed to fetch credits: ${response.status}`);
      }

      const data = await response.json();
      return {
        remaining: data.remaining,
        total: data.total,
        subscriptionStatus: data.subscription_status,
        unlimited: data.unlimited,
        lastUpdated: data.last_updated,
        planName: data.plan_name,
      };
    } catch (err) {
      console.error('Error fetching credits:', err);
      throw err;
    }
  }, []);

  // Refresh credits from server
  const refreshCredits = useCallback(async () => {
    try {
      setError(null);
      const newCredits = await fetchCredits();
      setCredits(newCredits);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch credits');
    }
  }, [fetchCredits]);

  // Initial load
  useEffect(() => {
    const loadCredits = async () => {
      setLoading(true);
      try {
        await refreshCredits();
      } finally {
        setLoading(false);
      }
    };

    loadCredits();
  }, [refreshCredits]);

  // Check if user has sufficient credits
  const checkCredits = useCallback(async (): Promise<boolean> => {
    if (!credits) {
      await refreshCredits();
      return false;
    }

    if (credits.unlimited) {
      return true;
    }

    return credits.remaining > 0;
  }, [credits, refreshCredits]);

  // Consume a credit for a feature
  const consumeCredit = useCallback(async (
    feature: FeatureType,
    generationId?: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      // Optimistic update for non-unlimited users
      if (credits && !credits.unlimited) {
        setCredits(prev => prev ? {
          ...prev,
          remaining: Math.max(0, prev.remaining - 1)
        } : null);
      }

      const response = await fetch('/api/user/credits/consume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          feature,
          generation_id: generationId,
          metadata,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Rollback optimistic update
        await refreshCredits();

        if (response.status === 402) {
          // Insufficient credits
          toast.error('Insufficient credits', {
            description: 'You need more credits to use this feature. Please upgrade your plan.',
            action: {
              label: 'Upgrade',
              onClick: () => {
                window.location.href = '/checkout';
              },
            },
          });
          return false;
        }

        throw new Error(data.error || 'Failed to consume credit');
      }

      // Update with server response
      if (credits) {
        setCredits(prev => prev ? {
          ...prev,
          remaining: data.unlimited ? -1 : data.remaining_credits,
          unlimited: data.unlimited,
        } : null);
      }

      // Show success message
      if (data.unlimited) {
        toast.success('Generation successful', {
          description: 'Unlimited generations available',
        });
      } else {
        toast.success('Credit consumed', {
          description: `${data.remaining_credits} credits remaining`,
        });
      }

      return true;
    } catch (err) {
      console.error('Error consuming credit:', err);
      
      // Rollback optimistic update
      await refreshCredits();
      
      toast.error('Credit system error', {
        description: 'Please try again or contact support',
      });
      
      return false;
    }
  }, [credits, refreshCredits]);

  // Upgrade to subscription
  const upgradeToSubscription = useCallback(async (
    planId: string,
    isYearly: boolean = false
  ): Promise<string> => {
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId,
          isYearly,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Track upgrade attempt
      console.log('🚀 Upgrade initiated:', {
        planId,
        isYearly,
        sessionId: data.sessionId
      });

      return data.url;
    } catch (error) {
      console.error('Error creating upgrade session:', error);
      toast.error('Upgrade failed', {
        description: 'Please try again or contact support',
      });
      throw error;
    }
  }, []);

  // Auto-refresh credits periodically (every 30 seconds)
  useEffect(() => {
    if (!credits) return;

    const interval = setInterval(() => {
      refreshCredits();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [credits, refreshCredits]);

  // Listen for focus events to refresh credits
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === 'visible') {
        refreshCredits();
      }
    };

    document.addEventListener('visibilitychange', handleFocus);
    window.addEventListener('focus', handleFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleFocus);
      window.removeEventListener('focus', handleFocus);
    };
  }, [refreshCredits]);

  // Listen for subscription changes (from webhooks)
  useEffect(() => {
    const handleSubscriptionChange = () => {
      console.log('🔄 Subscription change detected, refreshing credits...');
      refreshCredits();
    };

    // Listen for custom events from webhook processing
    window.addEventListener('subscription-updated', handleSubscriptionChange);
    
    return () => {
      window.removeEventListener('subscription-updated', handleSubscriptionChange);
    };
  }, [refreshCredits]);

  const value: CreditContextType = {
    credits,
    loading,
    error,
    consumeCredit,
    refreshCredits,
    checkCredits,
    upgradeToSubscription,
  };

  return (
    <CreditContext.Provider value={value}>
      {children}
    </CreditContext.Provider>
  );
}

// Hook to use credit context
export function useCredits(): CreditContextType {
  const context = useContext(CreditContext);
  if (context === undefined) {
    throw new Error('useCredits must be used within a CreditProvider');
  }
  return context;
}

// Hook to check if user has credits
export function useHasCredits(): boolean {
  const { credits } = useCredits();
  
  if (!credits) return false;
  if (credits.unlimited) return true;
  return credits.remaining > 0;
}

// Hook to get credit status
export function useCreditStatus(): {
  hasCredits: boolean;
  isLow: boolean;
  isEmpty: boolean;
  isUnlimited: boolean;
  planName?: string;
} {
  const { credits } = useCredits();
  
  if (!credits) {
    return {
      hasCredits: false,
      isLow: false,
      isEmpty: true,
      isUnlimited: false,
    };
  }

  if (credits.unlimited) {
    return {
      hasCredits: true,
      isLow: false,
      isEmpty: false,
      isUnlimited: true,
      planName: credits.planName,
    };
  }

  return {
    hasCredits: credits.remaining > 0,
    isLow: credits.remaining <= 2,
    isEmpty: credits.remaining === 0,
    isUnlimited: false,
    planName: credits.planName,
  };
}

// Hook for subscription management
export function useSubscription() {
  const { credits, upgradeToSubscription, refreshCredits } = useCredits();
  
  return {
    subscriptionStatus: credits?.subscriptionStatus || 'free',
    planName: credits?.planName,
    isUnlimited: credits?.unlimited || false,
    upgradeToSubscription,
    refreshSubscription: refreshCredits,
  };
}
