"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import type { PricingPlan } from '@/lib/config'
import { cn } from '@/lib/utils'

interface SubscribeButtonProps {
  plan: PricingPlan
  isYearly: boolean
  className?: string
  customerEmail?: string
}

export default function SubscribeButton({ 
  plan, 
  isYearly, 
  className,
  customerEmail 
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async () => {
    setLoading(true)
    
    try {
      const planId = plan.name.toLowerCase().replace(' ', '_')
      
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          isYearly,
          customerEmail,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Redirect to Creem checkout
      window.location.href = url
    } catch (error) {
      console.error('Checkout error:', error)
      setLoading(false)
      
      // Show error to user
      alert(error instanceof Error ? error.message : 'Payment failed. Please try again.')
    }
  }

  return (
    <Button 
      onClick={handleSubscribe}
      disabled={loading}
      className={cn(className)}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Processing...
        </>
      ) : (
        'Subscribe Now'
      )}
    </Button>
  )
} 