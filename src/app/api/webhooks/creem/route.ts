import { NextRequest, NextResponse } from 'next/server'

interface CreemWebhookEvent {
  id: string
  type: string
  data: {
    object: CreemSubscription | CreemPayment
  }
  created: number
}

interface CreemSubscription {
  id: string
  status: string
  customer_id: string
  plan_id: string
  created_at: number
  updated_at: number
}

interface CreemPayment {
  id: string
  amount: number
  currency: string
  status: string
  customer_id: string
  subscription_id?: string
  created_at: number
}

const handleSubscriptionCreated = async (subscription: CreemSubscription) => {
  console.log('Subscription created:', subscription.id)
  // TODO: Update user subscription status in database
  // TODO: Send welcome email
  // TODO: Grant access to features
}

const handleSubscriptionUpdated = async (subscription: CreemSubscription) => {
  console.log('Subscription updated:', subscription.id)
  // TODO: Update user subscription status in database
  // TODO: Handle plan changes
}

const handleSubscriptionCanceled = async (subscription: CreemSubscription) => {
  console.log('Subscription canceled:', subscription.id)
  // TODO: Update user subscription status in database
  // TODO: Revoke access to features
  // TODO: Send cancellation email
}

const handlePaymentSucceeded = async (payment: CreemPayment) => {
  console.log('Payment succeeded:', payment.id)
  // TODO: Update payment record in database
  // TODO: Send receipt email
}

const handlePaymentFailed = async (payment: CreemPayment) => {
  console.log('Payment failed:', payment.id)
  // TODO: Handle failed payment
  // TODO: Send payment failure notification
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    
    // Verify webhook signature (implement signature verification)
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('CREEM_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 })
    }

    // TODO: Implement signature verification
    // For now, we'll proceed without verification for development
    
    const event: CreemWebhookEvent = JSON.parse(body)

    console.log('Received webhook event:', event.type)

    // Handle different event types
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data.object as CreemSubscription)
        break
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data.object as CreemSubscription)
        break
        
      case 'subscription.canceled':
        await handleSubscriptionCanceled(event.data.object as CreemSubscription)
        break
        
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data.object as CreemPayment)
        break
        
      case 'payment.failed':
        await handlePaymentFailed(event.data.object as CreemPayment)
        break
        
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
} 