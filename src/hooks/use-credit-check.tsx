'use client';

import { useState, useCallback } from 'react';
import { useCredits } from '@/providers/credit-provider';
import { UpgradeModal } from '@/components/modals/upgrade-modal';
import { FeatureType } from '@/lib/types/credit-types';

interface UseCreditCheckOptions {
  feature: FeatureType;
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

interface UseCreditCheckReturn {
  checkAndConsumeCredit: (generationId?: string, metadata?: Record<string, unknown>) => Promise<boolean>;
  isUpgradeModalOpen: boolean;
  closeUpgradeModal: () => void;
  UpgradeModalComponent: React.ComponentType;
}

export function useCreditCheck({ 
  feature, 
  onSuccess, 
  onError 
}: UseCreditCheckOptions): UseCreditCheckReturn {
  const { credits, consumeCredit, checkCredits } = useCredits();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const checkAndConsumeCredit = useCallback(async (
    generationId?: string,
    metadata?: Record<string, unknown>
  ): Promise<boolean> => {
    try {
      // First check if user has credits
      const hasCredits = await checkCredits();
      
      if (!hasCredits) {
        // Show upgrade modal
        setIsUpgradeModalOpen(true);
        onError?.('Insufficient credits');
        return false;
      }

      // Consume the credit
      const success = await consumeCredit(feature, generationId, metadata);
      
      if (success) {
        onSuccess?.();
        return true;
      } else {
        // Credit consumption failed, likely insufficient credits
        setIsUpgradeModalOpen(true);
        onError?.('Failed to consume credit');
        return false;
      }
    } catch (error) {
      console.error('Credit check error:', error);
      onError?.('Credit system error');
      return false;
    }
  }, [feature, checkCredits, consumeCredit, onSuccess, onError]);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  const handleUpgrade = useCallback(() => {
    // Close modal and redirect to checkout
    setIsUpgradeModalOpen(false);
    window.location.href = '/checkout';
  }, []);

  const UpgradeModalComponent = useCallback(() => (
    <UpgradeModal
      isOpen={isUpgradeModalOpen}
      onClose={closeUpgradeModal}
      onUpgrade={handleUpgrade}
      feature={feature}
      remainingCredits={credits?.remaining || 0}
    />
  ), [isUpgradeModalOpen, closeUpgradeModal, handleUpgrade, feature, credits?.remaining]);

  return {
    checkAndConsumeCredit,
    isUpgradeModalOpen,
    closeUpgradeModal,
    UpgradeModalComponent,
  };
}

// Simplified hook for just checking credits without consuming
export function useHasCreditsCheck(): {
  hasCredits: boolean;
  checkCredits: () => Promise<boolean>;
  showUpgradeModal: () => void;
  UpgradeModalComponent: React.ComponentType;
} {
  const { credits, checkCredits } = useCredits();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const hasCredits = credits ? (credits.unlimited || credits.remaining > 0) : false;

  const showUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(true);
  }, []);

  const closeUpgradeModal = useCallback(() => {
    setIsUpgradeModalOpen(false);
  }, []);

  const handleUpgrade = useCallback(() => {
    setIsUpgradeModalOpen(false);
    window.location.href = '/checkout';
  }, []);

  const UpgradeModalComponent = useCallback(() => (
    <UpgradeModal
      isOpen={isUpgradeModalOpen}
      onClose={closeUpgradeModal}
      onUpgrade={handleUpgrade}
      remainingCredits={credits?.remaining || 0}
    />
  ), [isUpgradeModalOpen, closeUpgradeModal, handleUpgrade, credits?.remaining]);

  return {
    hasCredits,
    checkCredits,
    showUpgradeModal,
    UpgradeModalComponent,
  };
}
