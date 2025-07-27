import { db } from '../db';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';
import { onSubscriptionChange } from '../hooks/registration-hooks';
import { SubscriptionStatus } from '../types/credit-types';

export interface UserSubscription {
  id: string;
  userId: string;
  status: SubscriptionStatus;
  planId: string;
  planName: string;
  customerId: string;
  subscriptionId?: string;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  yearlyPrice: number;
  features: string[];
  creditsIncluded: number; // -1 for unlimited
  creemProductId: string;
  creemYearlyProductId?: string;
}

export class SubscriptionService {
  /**
   * Get user's current subscription status
   */
  static async getUserSubscription(userId: string): Promise<{
    status: SubscriptionStatus;
    planName?: string;
    isActive: boolean;
    hasUnlimitedCredits: boolean;
  }> {
    try {
      const user = await db
        .select({
          subscriptionStatus: users.subscriptionStatus,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        return {
          status: 'free',
          isActive: false,
          hasUnlimitedCredits: false,
        };
      }

      const status = user[0].subscriptionStatus as SubscriptionStatus;
      const isActive = status !== 'free';
      const hasUnlimitedCredits = status === 'pro' || status === 'expert';

      return {
        status,
        planName: status !== 'free' ? status.charAt(0).toUpperCase() + status.slice(1) : undefined,
        isActive,
        hasUnlimitedCredits,
      };
    } catch (error) {
      console.error('Error fetching user subscription:', error);
      return {
        status: 'free',
        isActive: false,
        hasUnlimitedCredits: false,
      };
    }
  }

  /**
   * Create checkout session for subscription upgrade
   */
  static async createCheckoutSession(
    userId: string,
    planId: string,
    isYearly: boolean = false
  ): Promise<{ sessionId: string; url: string }> {
    try {
      // Get user email for checkout
      const user = await db
        .select({
          email: users.email,
          name: users.name,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new Error('User not found');
      }

      // Create checkout session via existing API
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          isYearly,
          customerEmail: user[0].email,
          userId, // Add userId for tracking
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout session');
      }

      const data = await response.json();
      return {
        sessionId: data.sessionId,
        url: data.url,
      };
    } catch (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
  }

  /**
   * Handle successful subscription creation
   */
  static async handleSubscriptionCreated(
    userId: string,
    subscriptionData: {
      subscriptionId: string;
      customerId: string;
      planId: string;
      status: string;
    }
  ): Promise<void> {
    try {
      // Map plan ID to subscription status
      const subscriptionStatus = this.mapPlanToStatus(subscriptionData.planId);

      // Update user subscription status
      await db
        .update(users)
        .set({
          subscriptionStatus,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Call the subscription change hook
      await onSubscriptionChange(userId, subscriptionStatus);

      console.log(`✅ Subscription created for user ${userId}: ${subscriptionStatus}`);
    } catch (error) {
      console.error('Error handling subscription creation:', error);
      throw error;
    }
  }

  /**
   * Handle subscription status updates
   */
  static async handleSubscriptionUpdated(
    userId: string,
    subscriptionData: {
      subscriptionId: string;
      status: string;
      planId: string;
    }
  ): Promise<void> {
    try {
      let subscriptionStatus: SubscriptionStatus;

      // Handle different subscription statuses
      switch (subscriptionData.status) {
        case 'active':
          subscriptionStatus = this.mapPlanToStatus(subscriptionData.planId);
          break;
        case 'canceled':
        case 'expired':
        case 'unpaid':
          subscriptionStatus = 'free';
          break;
        default:
          subscriptionStatus = 'free';
      }

      // Update user subscription status
      await db
        .update(users)
        .set({
          subscriptionStatus,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Call the subscription change hook
      await onSubscriptionChange(userId, subscriptionStatus);

      console.log(`✅ Subscription updated for user ${userId}: ${subscriptionStatus}`);
    } catch (error) {
      console.error('Error handling subscription update:', error);
      throw error;
    }
  }

  /**
   * Handle subscription cancellation
   */
  static async handleSubscriptionCanceled(userId: string): Promise<void> {
    try {
      // Revert to free plan
      await db
        .update(users)
        .set({
          subscriptionStatus: 'free',
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Call the subscription change hook
      await onSubscriptionChange(userId, 'free');

      console.log(`✅ Subscription canceled for user ${userId}`);
    } catch (error) {
      console.error('Error handling subscription cancellation:', error);
      throw error;
    }
  }

  /**
   * Get available subscription plans
   */
  static getAvailablePlans(): SubscriptionPlan[] {
    return [
      {
        id: 'basic',
        name: 'Basic',
        price: 19,
        yearlyPrice: 190, // ~17/month
        features: [
          '100 generations per month',
          'All design features',
          'HD quality outputs',
          'Email support',
        ],
        creditsIncluded: 100,
        creemProductId: process.env.CREEM_BASIC_PRODUCT_ID || '',
        creemYearlyProductId: process.env.CREEM_BASIC_YEARLY_PRODUCT_ID,
      },
      {
        id: 'pro',
        name: 'Pro',
        price: 39,
        yearlyPrice: 390, // ~32.5/month
        features: [
          'Unlimited generations',
          'All design features',
          '4K quality outputs',
          'Priority support',
          'Advanced AI models',
        ],
        creditsIncluded: -1, // Unlimited
        creemProductId: process.env.CREEM_PRO_PRODUCT_ID || '',
        creemYearlyProductId: process.env.CREEM_PRO_YEARLY_PRODUCT_ID,
      },
      {
        id: 'expert',
        name: 'Expert',
        price: 79,
        yearlyPrice: 790, // ~65.8/month
        features: [
          'Unlimited generations',
          'All design features',
          '4K quality outputs',
          'Priority support',
          'Advanced AI models',
          'API access',
          'Custom training',
        ],
        creditsIncluded: -1, // Unlimited
        creemProductId: process.env.CREEM_EXPERT_PRODUCT_ID || '',
        creemYearlyProductId: process.env.CREEM_EXPERT_YEARLY_PRODUCT_ID,
      },
    ];
  }

  /**
   * Map Creem plan ID to our subscription status
   */
  private static mapPlanToStatus(planId: string): SubscriptionStatus {
    const planMap: Record<string, SubscriptionStatus> = {
      'basic': 'basic',
      'pro': 'pro',
      'expert': 'expert',
      // Handle variations
      'basic_monthly': 'basic',
      'basic_yearly': 'basic',
      'pro_monthly': 'pro',
      'pro_yearly': 'pro',
      'expert_monthly': 'expert',
      'expert_yearly': 'expert',
    };

    return planMap[planId.toLowerCase()] || 'free';
  }

  /**
   * Check if user has active subscription
   */
  static async hasActiveSubscription(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return subscription.isActive;
  }

  /**
   * Check if user has unlimited credits
   */
  static async hasUnlimitedCredits(userId: string): Promise<boolean> {
    const subscription = await this.getUserSubscription(userId);
    return subscription.hasUnlimitedCredits;
  }

  /**
   * Get user's plan limits
   */
  static async getUserPlanLimits(userId: string): Promise<{
    creditsIncluded: number;
    hasUnlimitedCredits: boolean;
    planName: string;
  }> {
    const subscription = await this.getUserSubscription(userId);
    const plans = this.getAvailablePlans();
    
    if (subscription.status === 'free') {
      return {
        creditsIncluded: 6, // Free tier gets 6 credits
        hasUnlimitedCredits: false,
        planName: 'Free',
      };
    }

    const plan = plans.find(p => p.id === subscription.status);
    if (!plan) {
      return {
        creditsIncluded: 6,
        hasUnlimitedCredits: false,
        planName: 'Free',
      };
    }

    return {
      creditsIncluded: plan.creditsIncluded,
      hasUnlimitedCredits: plan.creditsIncluded === -1,
      planName: plan.name,
    };
  }
}
