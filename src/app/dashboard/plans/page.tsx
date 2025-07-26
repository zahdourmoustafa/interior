'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { useCredits } from '@/providers/credit-provider';
import { motion } from 'framer-motion';
import { Crown, Check, AlertTriangle, Calendar, CreditCard, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { UpgradeModal } from '@/components/modals/upgrade-modal';
import { toast } from 'sonner';

// Plan configurations matching siteConfig
const planConfigs = {
  'basic_plan': {
    name: 'Basic Plan',
    price: 19,
    yearlyPrice: 15.8,
    credits: '1,000 Credits',
    features: [
      '100 Designs',
      '12 Videos', 
      '200 text-to-render designs',
      'High resolution designs',
      'Save generated designs',
      '4K Upscaling',
      'Commercial use'
    ],
    color: 'from-blue-500 to-blue-600'
  },
  'pro_plan': {
    name: 'Pro Plan',
    price: 39,
    yearlyPrice: 32.5,
    credits: '5,000 Credits',
    features: [
      '500 Designs',
      '65 Videos',
      '1000 text-to-render designs', 
      'High resolution designs',
      'Save generated designs',
      '4K Upscaling',
      'Commercial use'
    ],
    color: 'from-purple-500 to-purple-600',
    popular: true
  },
  'expert_plan': {
    name: 'Expert Plan',
    price: 79,
    yearlyPrice: 65.8,
    credits: '10,000 Credits',
    features: [
      '1000 Designs',
      '130 Videos',
      '2000 text-to-render designs',
      'High resolution designs',
      'Save generated designs',
      '4K Upscaling',
      'Commercial use'
    ],
    color: 'from-yellow-500 to-orange-600'
  }
};

export default function PlansPage() {
  const { credits, refreshCredits } = useCredits();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [subscriptionData, setSubscriptionData] = useState<{
    planId: string;
    status: string;
    billingCycle: string;
    nextBillingDate: string;
    cancelAtPeriodEnd: boolean;
    credits?: number;
  } | null>(null);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isYearly, setIsYearly] = useState(false);

  // Handle direct checkout for a specific plan
  const handleDirectCheckout = async (planId: string, planName: string) => {
    setIsProcessing(planId);
    
    // Map plan names to API plan IDs
    const planIdMap: { [key: string]: string } = {
      'Basic Plan': 'basic_plan',
      'Pro Plan': 'pro_plan', 
      'Expert Plan': 'expert_plan'
    };
    
    const apiPlanId = planIdMap[planName];
    
    if (!apiPlanId) {
      console.error('❌ Invalid plan name:', planName);
      setIsProcessing(null);
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
          planId: apiPlanId,
          isYearly: isYearly, // Use the toggle state
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
      console.error('Checkout error:', error);
      toast.error('Failed to start checkout. Please try again.');
      setIsProcessing(null);
    }
  };

  // Fetch subscription data
  useEffect(() => {
    const fetchSubscriptionData = async () => {
      try {
        const response = await fetch('/api/subscription/cancel', {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          setSubscriptionData(data);
        } else {
          console.error('Failed to fetch subscription data');
          // Set as free user (no subscription)
          setSubscriptionData(null);
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        // Set as free user (no subscription)
        setSubscriptionData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscriptionData();
  }, []);

  // Check if user has an active subscription
  const hasActiveSubscription = subscriptionData && 
    subscriptionData.status === 'active' && 
    subscriptionData.planId && 
    subscriptionData.planId !== 'free';

  const currentPlan = hasActiveSubscription ? planConfigs[subscriptionData.planId as keyof typeof planConfigs] : null;
  const isSubscriptionYearly = subscriptionData?.billingCycle === 'yearly';
  const currentPrice = isSubscriptionYearly ? currentPlan?.yearlyPrice : currentPlan?.price;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="bg-[#F8F8FA] min-h-screen p-6">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // If user doesn't have an active subscription, show available plans
  if (!hasActiveSubscription) {
    return (
      <DashboardLayout>
        <div className="bg-[#F8F8FA] min-h-screen p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">Choose Your Plan</h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Unlock the full potential of AI-powered interior design. Choose the plan that fits your needs.
              </p>
            </div>

            {/* Free Credits Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Free Credits</h3>
                  <p className="text-sm text-blue-700">You currently have {credits?.remaining || 0} free credits remaining</p>
                </div>
              </div>
              <p className="text-sm text-blue-700">
                Free credits are limited. Subscribe to a plan for unlimited generations and premium features.
              </p>
            </motion.div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-8">
              <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                    Monthly
                  </span>
                  <button
                    onClick={() => setIsYearly(!isYearly)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
                      isYearly ? 'bg-purple-600' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isYearly ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                    Yearly
                  </span>
                  {isYearly && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Save up to 30%
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Pricing Plans */}
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {planConfigs && Object.entries(planConfigs).map(([planId, plan], index) => (
                <motion.div
                  key={planId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative bg-white rounded-2xl shadow-lg border-2 p-8 cursor-pointer transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                    plan.popular ? 'border-purple-500 ring-2 ring-purple-500 ring-opacity-20' : 'border-gray-200'
                  }`}
                  onClick={() => setIsUpgradeModalOpen(true)}
                >
                  {/* Popular badge */}
                  {plan.popular && (
                    <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1">
                        <Crown className="w-2.5 h-2.5" />
                        Popular
                      </div>
                    </div>
                  )}

                  {/* Plan header */}
                  <div className="text-center mb-6">
                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${plan.color} flex items-center justify-center mb-4`}>
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        ${isYearly ? plan.yearlyPrice : plan.price}
                      </span>
                      <span className="text-gray-600">/{isYearly ? 'year' : 'month'}</span>
                    </div>
                    {isYearly ? (
                      <p className="text-sm text-gray-600 mt-1">
                        <span className="line-through text-gray-400">${plan.price * 12}/year</span>
                        <span className="text-green-600 font-medium ml-2">
                          Save ${Math.round((plan.price * 12) - (plan.yearlyPrice * 12))}
                        </span>
                      </p>
                    ) : (
                      <p className="text-sm text-gray-600 mt-1">
                        or ${plan.yearlyPrice}/month billed yearly
                      </p>
                    )}
                  </div>

                  {/* Credits */}
                  <div className="text-center mb-6">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="text-lg font-semibold text-gray-900">{plan.credits}</div>
                      <div className="text-sm text-gray-600">per {isYearly ? 'year' : 'month'}</div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                          <Check className="w-3 h-3 text-green-600" />
                        </div>
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button
                    className={`w-full bg-gradient-to-r ${plan.color} hover:opacity-90 text-white font-medium py-3`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectCheckout(planId, plan.name);
                    }}
                    disabled={isProcessing === planId}
                  >
                    {isProcessing === planId ? 'Processing...' : 'Get Started'}
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Features comparison */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
            >
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">Why Choose a Paid Plan?</h3>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-4">
                    <Zap className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Unlimited Generations</h4>
                  <p className="text-gray-600 text-sm">Create as many designs as you want without worrying about credits</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-4">
                    <Crown className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Premium Features</h4>
                  <p className="text-gray-600 text-sm">Access to advanced AI models and high-resolution outputs</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-4">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Priority Support</h4>
                  <p className="text-gray-600 text-sm">Get faster response times and dedicated customer support</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleCancelSubscription = async () => {
    setIsCancelling(true);
    
    try {
      // API call to cancel subscription
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to cancel subscription');
      }

      toast.success('Subscription cancelled successfully');
      setIsCancelModalOpen(false);
      
      // Refresh credits to show 0
      await refreshCredits();
      
    } catch (error) {
      console.error('Cancel subscription error:', error);
      toast.error('Failed to cancel subscription. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-[#F8F8FA] min-h-screen p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Subscription Plans</h1>
            <p className="text-gray-600">Manage your subscription and billing</p>
          </div>

          {/* Current Plan Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${currentPlan?.color} text-white`}>
                  <Crown className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Current Plan</h2>
                  <p className="text-gray-600">Your active subscription</p>
                </div>
              </div>
              
              {currentPlan?.popular && (
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Plan Details */}
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{currentPlan?.name}</h3>
                <div className="flex items-baseline gap-2 mb-4">
                  <span className="text-3xl font-bold text-gray-900">${currentPrice}</span>
                  <span className="text-gray-600">/{isSubscriptionYearly ? 'year' : 'month'}</span>
                  {isSubscriptionYearly && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      Save {Math.round(((currentPlan?.price || 0) * 12 - (currentPlan?.yearlyPrice || 0) * 12) / ((currentPlan?.price || 0) * 12) * 100)}%
                    </span>
                  )}
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="w-4 h-4" />
                    <span>Next billing: {subscriptionData ? new Date(subscriptionData.nextBillingDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <CreditCard className="w-4 h-4" />
                    <span>Status: {subscriptionData?.status || 'Unknown'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Zap className="w-4 h-4" />
                    <span>{currentPlan?.credits} per {isSubscriptionYearly ? 'year' : 'month'}</span>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button
                    onClick={() => setIsUpgradeModalOpen(true)}
                    className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white"
                  >
                    <Crown className="w-4 h-4 mr-2" />
                    Change Plan
                  </Button>
                  
                  <Button
                    onClick={() => setIsCancelModalOpen(true)}
                    variant="outline"
                    className="border-red-200 text-red-600 hover:bg-red-50"
                  >
                    Cancel Subscription
                  </Button>
                </div>
              </div>

              {/* Plan Features */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-4">Plan Features</h4>
                <div className="space-y-3">
                  {currentPlan?.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Credits Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Current Usage</h3>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">
                  {credits?.remaining || 0}
                </div>
                <div className="text-sm text-gray-600">Credits Remaining</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-1">
                  {credits?.total || 0}
                </div>
                <div className="text-sm text-gray-600">Total Credits</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {credits?.unlimited ? '∞' : Math.round(((credits?.remaining || 0) / (credits?.total || 1)) * 100)}%
                </div>
                <div className="text-sm text-gray-600">Usage Remaining</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={isUpgradeModalOpen}
        onClose={() => setIsUpgradeModalOpen(false)}
        onUpgrade={() => setIsUpgradeModalOpen(false)}
        remainingCredits={credits?.remaining || 0}
      />

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Cancel Subscription</h3>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">Warning</h4>
                  <p className="text-sm text-red-700">
                    After cancellation, you will have <strong>0 credits</strong> and won&apos;t be able to generate any designs until you subscribe to a new plan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => setIsCancelModalOpen(false)}
                variant="outline"
                className="flex-1"
                disabled={isCancelling}
              >
                Keep Subscription
              </Button>
              <Button
                onClick={handleCancelSubscription}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Subscription'}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </DashboardLayout>
  );
}
