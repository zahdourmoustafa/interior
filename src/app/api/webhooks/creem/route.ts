import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

interface CreemWebhookEvent {
  id: string;
  type: string;
  data: {
    object: CreemSubscription | CreemPayment | CreemCheckout;
  };
  created: number;
}

interface CreemSubscription {
  id: string;
  status: string;
  customer_id: string;
  plan_id: string;
  customer_email?: string;
  metadata?: {
    user_id?: string;
    plan_name?: string;
  };
  created_at: number;
  updated_at: number;
}

interface CreemPayment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  customer_id: string;
  customer_email?: string;
  subscription_id?: string;
  metadata?: {
    user_id?: string;
  };
  created_at: number;
}

interface CreemCheckout {
  id: string;
  status: string;
  customer_id: string;
  customer_email?: string;
  subscription_id?: string;
  metadata?: {
    user_id?: string;
    plan_id?: string;
  };
  created_at: number;
}

/**
 * Find user by email or metadata user_id
 */
async function findUserFromWebhookData(
  customerEmail?: string,
  userId?: string
): Promise<string | null> {
  try {
    // First try to find by user_id in metadata
    if (userId) {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      if (user.length > 0) {
        return user[0].id;
      }
    }

    // Fallback to finding by email
    if (customerEmail) {
      const user = await db
        .select({ id: users.id })
        .from(users)
        .where(eq(users.email, customerEmail))
        .limit(1);
      
      if (user.length > 0) {
        return user[0].id;
      }
    }

    return null;
  } catch (error) {
    console.error('Error finding user from webhook data:', error);
    return null;
  }
}

const handleSubscriptionCreated = async (subscription: CreemSubscription) => {
  console.log('🎉 Subscription created:', subscription.id);
  
  try {
    const userId = await findUserFromWebhookData(
      subscription.customer_email,
      subscription.metadata?.user_id
    );

    if (!userId) {
      console.error('❌ Could not find user for subscription:', subscription.id);
      return;
    }

    await SubscriptionService.handleSubscriptionCreated(userId, {
      subscriptionId: subscription.id,
      customerId: subscription.customer_id,
      planId: subscription.plan_id,
      status: subscription.status,
    });

    console.log('✅ Subscription created successfully for user:', userId);
  } catch (error) {
    console.error('❌ Error handling subscription creation:', error);
    throw error;
  }
};

const handleSubscriptionUpdated = async (subscription: CreemSubscription) => {
  console.log('🔄 Subscription updated:', subscription.id);
  
  try {
    const userId = await findUserFromWebhookData(
      subscription.customer_email,
      subscription.metadata?.user_id
    );

    if (!userId) {
      console.error('❌ Could not find user for subscription:', subscription.id);
      return;
    }

    await SubscriptionService.handleSubscriptionUpdated(userId, {
      subscriptionId: subscription.id,
      status: subscription.status,
      planId: subscription.plan_id,
    });

    console.log('✅ Subscription updated successfully for user:', userId);
  } catch (error) {
    console.error('❌ Error handling subscription update:', error);
    throw error;
  }
};

const handleSubscriptionCanceled = async (subscription: CreemSubscription) => {
  console.log('❌ Subscription canceled:', subscription.id);
  
  try {
    const userId = await findUserFromWebhookData(
      subscription.customer_email,
      subscription.metadata?.user_id
    );

    if (!userId) {
      console.error('❌ Could not find user for subscription:', subscription.id);
      return;
    }

    await SubscriptionService.handleSubscriptionCanceled(userId);

    console.log('✅ Subscription canceled successfully for user:', userId);
  } catch (error) {
    console.error('❌ Error handling subscription cancellation:', error);
    throw error;
  }
};

const handlePaymentSucceeded = async (payment: CreemPayment) => {
  console.log('💰 Payment succeeded:', payment.id);
  
  try {
    const userId = await findUserFromWebhookData(
      payment.customer_email,
      payment.metadata?.user_id
    );

    if (userId) {
      console.log('✅ Payment processed for user:', userId);
      // Additional payment processing logic can be added here
      // For example: send receipt email, update payment records, etc.
    } else {
      console.warn('⚠️ Could not find user for payment:', payment.id);
    }
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
  }
};

const handlePaymentFailed = async (payment: CreemPayment) => {
  console.log('💸 Payment failed:', payment.id);
  
  try {
    const userId = await findUserFromWebhookData(
      payment.customer_email,
      payment.metadata?.user_id
    );

    if (userId) {
      console.log('⚠️ Payment failed for user:', userId);
      // Handle failed payment logic
      // For example: send notification, update subscription status, etc.
    } else {
      console.warn('⚠️ Could not find user for failed payment:', payment.id);
    }
  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
  }
};

const handleCheckoutCompleted = async (checkout: CreemCheckout) => {
  console.log('🛒 Checkout completed:', checkout.id);
  
  try {
    const userId = await findUserFromWebhookData(
      checkout.customer_email,
      checkout.metadata?.user_id
    );

    if (userId) {
      console.log('✅ Checkout completed for user:', userId);
      // The subscription.created event will handle the actual subscription setup
    } else {
      console.warn('⚠️ Could not find user for checkout:', checkout.id);
    }
  } catch (error) {
    console.error('❌ Error handling checkout completion:', error);
  }
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    
    // Verify webhook signature
    const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('❌ CREEM_WEBHOOK_SECRET not configured');
      return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
    }

    // TODO: Implement proper signature verification
    // const signature = request.headers.get('creem-signature');
    // if (!verifySignature(body, signature, webhookSecret)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    // }
    
    const event: CreemWebhookEvent = JSON.parse(body);

    console.log(`📨 Received webhook event: ${event.type}`);

    // Handle different event types
    switch (event.type) {
      case 'subscription.created':
        await handleSubscriptionCreated(event.data.object as CreemSubscription);
        break;
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(event.data.object as CreemSubscription);
        break;
        
      case 'subscription.canceled':
      case 'subscription.deleted':
        await handleSubscriptionCanceled(event.data.object as CreemSubscription);
        break;
        
      case 'payment.succeeded':
        await handlePaymentSucceeded(event.data.object as CreemPayment);
        break;
        
      case 'payment.failed':
        await handlePaymentFailed(event.data.object as CreemPayment);
        break;
        
      case 'checkout.completed':
        await handleCheckoutCompleted(event.data.object as CreemCheckout);
        break;
        
      default:
        console.log(`ℹ️ Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
