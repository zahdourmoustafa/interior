'use client';

import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Crown, Check, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FeatureType } from '@/lib/types/credit-types';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature?: FeatureType;
  remainingCredits?: number;
}

const featureNames = {
  interior: 'Interior Design',
  exterior: 'Exterior Design',
  sketch: 'Sketch to Reality',
  furnish: 'Furnish Empty Space',
  remove: 'Remove Object',
  video: 'Generate Video',
  text: 'Text to Design',
};

const plans = [
  {
    name: 'Basic',
    price: 19,
    credits: 100,
    features: [
      '100 generations per month',
      'All design features',
      'HD quality outputs',
      'Email support',
    ],
    popular: false,
    color: 'from-blue-500 to-blue-600',
  },
  {
    name: 'Pro',
    price: 39,
    credits: -1, // Unlimited
    features: [
      'Unlimited generations',
      'All design features',
      '4K quality outputs',
      'Priority support',
      'Advanced AI models',
    ],
    popular: true,
    color: 'from-purple-500 to-purple-600',
  },
  {
    name: 'Expert',
    price: 79,
    credits: -1, // Unlimited
    features: [
      'Unlimited generations',
      'All design features',
      '4K quality outputs',
      'Priority support',
      'Advanced AI models',
      'API access',
      'Custom training',
    ],
    popular: false,
    color: 'from-yellow-500 to-orange-600',
  },
];

export function UpgradeModal({ 
  isOpen, 
  onClose, 
  feature,
  remainingCredits = 0 
}: UpgradeModalProps) {
  const [selectedPlan, setSelectedPlan] = useState('Pro');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isYearly, setIsYearly] = useState(false);

  if (!isOpen) return null;

  const featureName = feature ? (featureNames as Record<string, string>)[feature] || 'this feature' : 'this feature';

  const handleUpgrade = async () => {
    setIsProcessing(true);
    
    // Map modal plan names to siteConfig plan IDs
    const planIdMap: { [key: string]: string } = {
      'Basic': 'basic_plan',
      'Pro': 'pro_plan', 
      'Expert': 'expert_plan'
    };
    
    const planId = planIdMap[selectedPlan];
    
    console.log('🔍 Checkout Debug:', {
      selectedPlan,
      mappedPlanId: planId,
      isYearly,
      planIdMap
    });
    
    if (!planId) {
      console.error('❌ Invalid plan name:', selectedPlan);
      setIsProcessing(false);
      return;
    }
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          planId: planId, // Send the mapped plan ID
          isYearly,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      
      // Redirect to Creem checkout
      window.location.href = data.url;
    } catch (error) {
      console.error('Upgrade error:', error);
      // Handle error - could show toast or error message
      setIsProcessing(false);
    }
  };

  // Only render portal on client side
  if (typeof window === 'undefined') {
    return null;
  }

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999]"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="relative p-8 pb-6 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/50 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">
                    You&apos;ve used all your free credits!
                  </h2>
                  
                  <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {remainingCredits === 0 
                      ? `You need more credits to use ${featureName}. Upgrade to continue creating amazing designs.`
                      : `You have ${remainingCredits} credits remaining. Upgrade for unlimited access to all features.`
                    }
                  </p>
                </div>
              </div>

              {/* Plans */}
              <div className="p-8">
                {/* Billing toggle */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <span className={`text-sm ${!isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    Monthly
                  </span>
                  <button
                    onClick={() => setIsYearly(!isYearly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isYearly ? 'bg-purple-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isYearly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${isYearly ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                    Yearly
                    <span className="ml-1 text-xs text-green-600 font-medium">(Save 20%)</span>
                  </span>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  {plans.map((plan) => (
                    <motion.div
                      key={plan.name}
                      className={`relative rounded-2xl border-2 p-6 cursor-pointer transition-all duration-200 ${
                        selectedPlan === plan.name
                          ? 'border-purple-500 shadow-lg shadow-purple-500/20'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPlan(plan.name)}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {/* Popular badge */}
                      {plan.popular && (
                        <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            Popular
                          </div>
                        </div>
                      )}

                      {/* Plan header */}
                      <div className="text-center mb-6">
                        <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${plan.color} rounded-xl mb-3`}>
                          {plan.name === 'Expert' ? (
                            <Crown className="w-6 h-6 text-white" />
                          ) : (
                            <Zap className="w-6 h-6 text-white" />
                          )}
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-1">
                          {plan.name}
                        </h3>
                        
                        <div className="flex items-baseline justify-center gap-1">
                          <span className="text-3xl font-bold text-gray-900">
                            ${isYearly ? Math.round(plan.price * 12 * 0.8) : plan.price}
                          </span>
                          <span className="text-gray-500">
                            /{isYearly ? 'year' : 'month'}
                          </span>
                        </div>
                        
                        {isYearly && (
                          <p className="text-xs text-green-600 font-medium">
                            Save ${Math.round(plan.price * 12 * 0.2)}/year
                          </p>
                        )}
                        
                        <p className="text-sm text-gray-500 mt-1">
                          {plan.credits === -1 ? 'Unlimited generations' : `${plan.credits} generations/month`}
                        </p>
                      </div>

                      {/* Features */}
                      <ul className="space-y-3 mb-6">
                        {plan.features.map((feature, index) => (
                          <li key={index} className="flex items-center gap-3">
                            <div className="flex-shrink-0 w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-green-600" />
                            </div>
                            <span className="text-sm text-gray-600">{feature}</span>
                          </li>
                        ))}
                      </ul>

                      {/* Selection indicator */}
                      {selectedPlan === plan.name && (
                        <motion.div
                          layoutId="selectedPlan"
                          className="absolute inset-0 rounded-2xl border-2 border-purple-500 bg-purple-500/5"
                          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                        />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-200">
                  <Button
                    variant="outline"
                    onClick={onClose}
                    className="flex-1 h-12 text-gray-600 border-gray-300 hover:bg-gray-50"
                  >
                    Maybe Later
                  </Button>
                  
                  <Button
                    onClick={handleUpgrade}
                    disabled={isProcessing}
                    className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Processing...</span>
                      </>
                    ) : (
                      <>
                        <span>Upgrade to {selectedPlan}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>

                {/* Trust indicators */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <p className="text-sm text-gray-500 mb-2">
                    Join thousands of designers who trust ArchiCassoAI
                  </p>
                  <div className="flex items-center justify-center gap-4 text-xs text-gray-400">
                    <span>✓ Cancel anytime</span>
                    <span>✓ 30-day money back</span>
                    <span>✓ Secure payment</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
}
