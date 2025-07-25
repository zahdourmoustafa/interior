import { NextRequest, NextResponse } from 'next/server'
import { creem } from '@/lib/creem'
import { siteConfig } from '@/lib/config'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { planId, isYearly, customerEmail } = body

    // Validate required fields
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Find the plan from config
    const plan = siteConfig.pricing.find(
      p => p.name.toLowerCase().replace(' ', '_') === planId
    )

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Convert plan to checkout data
    const checkoutData = creem.planToCheckoutData(plan, isYearly || false)
    
    // Add optional customer email
    if (customerEmail) {
      checkoutData.customerEmail = customerEmail
    }

    // Create checkout session
    const session = await creem.createCheckoutSession(checkoutData)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error) {
    console.error('Checkout error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    )
  }
} 