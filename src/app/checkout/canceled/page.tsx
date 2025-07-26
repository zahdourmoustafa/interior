'use client';

import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { XCircle, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function CheckoutCanceledPage() {
  return (
    <DashboardLayout>
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-2xl w-full text-center">
          {/* Canceled Icon */}
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full mb-6">
            <XCircle className="w-12 h-12 text-white" />
          </div>

          {/* Canceled Message */}
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Checkout Canceled
          </h1>
          
          <p className="text-xl text-gray-600 mb-8">
            No worries! Your checkout was canceled and no payment was processed.
          </p>

          {/* What's Next */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              What would you like to do?
            </h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Continue with Free Plan
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  You still have your free credits to explore our features.
                </p>
                <Link href="/dashboard">
                  <Button variant="outline" className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </Link>
              </div>
              
              <div className="text-left">
                <h3 className="font-semibold text-gray-900 mb-2">
                  Try Again Later
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  Upgrade anytime when you&apos;re ready for unlimited generations.
                </p>
                <Link href="/checkout">
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                    View Plans
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Free Features Reminder */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🎨 You can still create with your free credits!
            </h3>
            <p className="text-gray-600">
              Explore all our features and see what ArchiCassoAI can do for you.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/redecorate-room">
              <Button variant="outline" className="px-8 py-3 rounded-xl font-medium">
                Try Interior Design
              </Button>
            </Link>
            
            <Link href="/dashboard/redesign-exterior">
              <Button variant="outline" className="px-8 py-3 rounded-xl font-medium">
                Try Exterior Design
              </Button>
            </Link>
            
            <Link href="/dashboard/sketch-to-reality">
              <Button variant="outline" className="px-8 py-3 rounded-xl font-medium">
                Try Sketch to Reality
              </Button>
            </Link>
          </div>

          {/* Support Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-500 mb-2">
              Have questions about our plans?
            </p>
            <p className="text-sm text-gray-600">
              Contact us at{' '}
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
