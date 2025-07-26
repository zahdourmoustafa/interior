'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { CheckCircle, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCredits } from '@/providers/credit-provider';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const { refreshCredits } = useCredits();
  const [isLoading, setIsLoading] = useState(true);
  
  const plan = searchParams.get('plan') || 'Pro';
  const isYearly = searchParams.get('yearly') === 'true';

  useEffect(() => {
    // Refresh credits after successful checkout
    const refreshAfterCheckout = async () => {
      // Wait a bit for webhook to process
      await new Promise(resolve => setTimeout(resolve, 2000));
      await refreshCredits();
      setIsLoading(false);
    };

    refreshAfterCheckout();
  }, [refreshCredits]);

  const planFeatures = {
    basic: [
      '100 generations per month',
      'All design features',
      'HD quality outputs',
      'Email support',
    ],
    pro: [
      'Unlimited generations',
      'All design features', 
      '4K quality outputs',
      'Priority support',
      'Advanced AI models',
    ],
    expert: [
      'Unlimited generations',
      'All design features',
      '4K quality outputs', 
      'Priority support',
      'Advanced AI models',
      'API access',
      'Custom training',
    ],
  };

  const features = planFeatures[plan.toLowerCase() as keyof typeof planFeatures] || planFeatures.pro;

  return (
    <DashboardLayout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Success Icon */}
          <div className="relative mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full mb-6">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute -top-2 -right-2">
              <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            </div>
          </div>

          {/* Success Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Welcome to {plan} Plan! 🎉
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            Your subscription has been activated successfully. 
            {isYearly ? ' Thanks for choosing yearly billing!' : ''}
          </p>

          {/* Plan Features */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8 text-left">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Your {plan} Plan Includes:
            </h2>
            
            <div className="grid md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Credit Status */}
          {!isLoading && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🚀 You now have unlimited generations!
              </h3>
              <p className="text-gray-600">
                Start creating amazing designs without worrying about credits.
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard">
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 rounded-xl font-medium flex items-center gap-2">
                <span>Start Creating</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            
            <Link href="/dashboard/redecorate-room">
              <Button variant="outline" className="px-8 py-3 rounded-xl font-medium">
                Try Interior Design
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Need help getting started?
            </p>
            <p className="text-sm text-gray-600">
              Contact our support team at{' '}
              <a href="mailto:support@archicassoai.com" className="text-purple-600 hover:underline">
                support@archicassoai.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
