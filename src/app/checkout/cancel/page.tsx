"use client"

import { XCircle, ArrowLeft, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Payment Canceled
          </CardTitle>
          <CardDescription className="text-lg">
            Your payment was not processed
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">What happened?</h3>
            <p className="text-sm text-gray-600">
              You canceled the payment process or closed the payment window. 
              No charges were made to your account.
            </p>
          </div>

          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Need help?</h3>
            <ul className="space-y-2 text-sm text-blue-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Contact our support team
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Check our FAQ section
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                Try a different payment method
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <Link href="/#pricing">
              <Button className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </Link>
            
            <Link href="/">
              <Button variant="outline" className="w-full">
                Return Home
              </Button>
            </Link>

            <Link href="/contact">
              <Button variant="ghost" className="w-full">
                Contact Support
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          <p className="text-xs text-gray-500 text-center">
            If you&apos;re experiencing issues, please don&apos;t hesitate to reach out to our support team.
          </p>
        </CardContent>
      </Card>
    </div>
  )
} 