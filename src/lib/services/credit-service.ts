import { db } from '../db';
import { users, creditTransactions } from '../db/schema';
import { eq, desc,  gte, count } from 'drizzle-orm';
import { 
  FeatureType, 
  SubscriptionStatus, 
  UserCredits, 
  CreditConsumptionRequest,
  CreditConsumptionResponse,
  CreditHistory,
  InsufficientCreditsError,
  CreditSystemError,
  CREDIT_CONSTANTS
} from '../types/credit-types';

export class CreditService {
  /**
   * Get current credit status for a user
   */
  static async getUserCredits(userId: string): Promise<UserCredits> {
    try {
      const user = await db
        .select({
          creditsRemaining: users.creditsRemaining,
          creditsTotal: users.creditsTotal,
          subscriptionStatus: users.subscriptionStatus,
          updatedAt: users.updatedAt,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new CreditSystemError('User not found', 'USER_NOT_FOUND');
      }

      const userData = user[0];
      
      return {
        remaining: userData.creditsRemaining,
        total: userData.creditsTotal,
        subscriptionStatus: userData.subscriptionStatus as SubscriptionStatus,
        lastUpdated: userData.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching user credits:', error);
      throw new CreditSystemError('Failed to fetch user credits', 'FETCH_ERROR');
    }
  }

  /**
   * Check if user has sufficient credits for a feature
   */
  static async validateCreditUsage(userId: string, requiredCredits: number = 1): Promise<boolean> {
    try {
      const userCredits = await this.getUserCredits(userId);
      
      // Check if user has unlimited credits (paid subscription)
      if (this.hasUnlimitedCredits(userCredits.subscriptionStatus)) {
        return true;
      }

      return userCredits.remaining >= requiredCredits;
    } catch (error) {
      console.error('Error validating credit usage:', error);
      return false;
    }
  }

  /**
   * Consume credits for a feature usage
   */
  static async consumeCredit(
    userId: string, 
    request: CreditConsumptionRequest
  ): Promise<CreditConsumptionResponse> {
    try {
      // Get current user credits (without transaction due to Neon HTTP driver limitation)
      const user = await db
        .select({
          creditsRemaining: users.creditsRemaining,
          subscriptionStatus: users.subscriptionStatus,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new CreditSystemError('User not found', 'USER_NOT_FOUND');
      }

      const userData = user[0];
      const subscriptionStatus = userData.subscriptionStatus as SubscriptionStatus;

      // Check if user has unlimited credits
      if (this.hasUnlimitedCredits(subscriptionStatus)) {
        // Log the transaction for analytics but don't deduct credits
        await db.insert(creditTransactions).values({
          userId,
          featureUsed: request.feature,
          creditsConsumed: 0, // No credits consumed for paid users
          generationId: request.generationId,
          metadata: { 
            ...request.metadata, 
            subscriptionStatus,
            unlimited: true 
          },
        });

        return {
          success: true,
          remainingCredits: -1, // Indicates unlimited
          message: 'Generation successful (unlimited)',
          canProceed: true,
        };
      }

      // Check if user has sufficient credits
      const requiredCredits = CREDIT_CONSTANTS.CREDITS_PER_GENERATION;
      if (userData.creditsRemaining < requiredCredits) {
        throw new InsufficientCreditsError(userData.creditsRemaining, requiredCredits);
      }

      // Deduct credits (without transaction - potential race condition but acceptable for this use case)
      const newCreditsRemaining = userData.creditsRemaining - requiredCredits;
      
      await db
        .update(users)
        .set({ 
          creditsRemaining: newCreditsRemaining,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log the transaction
      await db.insert(creditTransactions).values({
        userId,
        featureUsed: request.feature,
        creditsConsumed: requiredCredits,
        generationId: request.generationId,
        metadata: request.metadata,
      });

      return {
        success: true,
        remainingCredits: newCreditsRemaining,
        message: `Credit consumed successfully. ${newCreditsRemaining} credits remaining.`,
        canProceed: true,
      };
    } catch (error) {
      if (error instanceof InsufficientCreditsError) {
        return {
          success: false,
          remainingCredits: error.remainingCredits,
          message: 'Insufficient credits. Please upgrade to continue.',
          canProceed: false,
        };
      }

      console.error('Error consuming credit:', error);
      throw new CreditSystemError('Failed to consume credit', 'CONSUMPTION_ERROR');
    }
  }

  /**
   * Grant credits to a user (for admin use or promotions)
   */
  static async grantCredits(
    userId: string, 
    amount: number, 
    reason: string = 'manual_grant'
  ): Promise<void> {
    try {
      // Get current credits (without transaction)
      const user = await db
        .select({
          creditsRemaining: users.creditsRemaining,
          creditsTotal: users.creditsTotal,
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user.length) {
        throw new CreditSystemError('User not found', 'USER_NOT_FOUND');
      }

      const userData = user[0];
      const newCreditsRemaining = userData.creditsRemaining + amount;
      const newCreditsTotal = Math.max(userData.creditsTotal, newCreditsRemaining);

      // Update user credits
      await db
        .update(users)
        .set({
          creditsRemaining: newCreditsRemaining,
          creditsTotal: newCreditsTotal,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log the grant
      await db.insert(creditTransactions).values({
        userId,
        featureUsed: 'grant' as FeatureType, // Special feature type for grants
        creditsConsumed: -amount, // Negative for grants
        metadata: { reason, grantedAmount: amount },
      });
    } catch (error) {
      console.error('Error granting credits:', error);
      throw new CreditSystemError('Failed to grant credits', 'GRANT_ERROR');
    }
  }

  /**
   * Get credit usage history for a user
   */
  static async getCreditHistory(
    userId: string, 
    limit: number = 50
  ): Promise<CreditHistory> {
    try {
      const transactions = await db
        .select()
        .from(creditTransactions)
        .where(eq(creditTransactions.userId, userId))
        .orderBy(desc(creditTransactions.createdAt))
        .limit(limit);

      const totalConsumed = transactions
        .filter(t => t.creditsConsumed > 0)
        .reduce((sum, t) => sum + t.creditsConsumed, 0);

      // Calculate most used feature
      const featureUsage = transactions.reduce((acc, t) => {
        if (t.creditsConsumed > 0) {
          acc[t.featureUsed] = (acc[t.featureUsed] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const mostUsedFeature = Object.entries(featureUsage)
        .sort(([,a], [,b]) => b - a)[0]?.[0] as FeatureType || 'interior';

      // Calculate average daily usage (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentTransactions = transactions.filter(
        t => t.createdAt >= thirtyDaysAgo && t.creditsConsumed > 0
      );
      const averageDaily = recentTransactions.length / 30;

      return {
        transactions: transactions.map(t => ({
          id: t.id,
          userId: t.userId,
          featureUsed: t.featureUsed as FeatureType,
          creditsConsumed: t.creditsConsumed,
          generationId: t.generationId || undefined,
          metadata: (t.metadata as Record<string, unknown>) || {},
          createdAt: t.createdAt,
        })),
        totalConsumed,
        mostUsedFeature,
        averageDaily,
      };
    } catch (error) {
      console.error('Error fetching credit history:', error);
      throw new CreditSystemError('Failed to fetch credit history', 'HISTORY_ERROR');
    }
  }

  /**
   * Initialize credits for a new user
   */
  static async initializeUserCredits(userId: string): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          creditsRemaining: CREDIT_CONSTANTS.DEFAULT_CREDITS,
          creditsTotal: CREDIT_CONSTANTS.DEFAULT_CREDITS,
          subscriptionStatus: 'free',
          creditsGrantedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));

      // Log the initial grant
      await db.insert(creditTransactions).values({
        userId,
        featureUsed: 'grant' as FeatureType,
        creditsConsumed: -CREDIT_CONSTANTS.DEFAULT_CREDITS,
        metadata: { 
          reason: 'initial_signup',
          grantedAmount: CREDIT_CONSTANTS.DEFAULT_CREDITS 
        },
      });
    } catch (error) {
      console.error('Error initializing user credits:', error);
      throw new CreditSystemError('Failed to initialize user credits', 'INIT_ERROR');
    }
  }

  /**
   * Update user subscription status
   */
  static async updateSubscriptionStatus(
    userId: string, 
    subscriptionStatus: SubscriptionStatus
  ): Promise<void> {
    try {
      await db
        .update(users)
        .set({
          subscriptionStatus,
          updatedAt: new Date(),
        })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error('Error updating subscription status:', error);
      throw new CreditSystemError('Failed to update subscription status', 'UPDATE_ERROR');
    }
  }

  /**
   * Check if user has unlimited credits based on subscription
   */
  private static hasUnlimitedCredits(subscriptionStatus: SubscriptionStatus): boolean {
    return CREDIT_CONSTANTS.SUBSCRIPTION_BENEFITS[subscriptionStatus].unlimited;
  }

  /**
   * Get system-wide credit analytics (admin only)
   */
  static async getCreditAnalytics(days: number = 30): Promise<{
    totalCreditsConsumed: number;
    totalTransactions: number;
    featureBreakdown: Record<string, number>;
    dailyUsage: Array<{ date: string; credits: number }>;
    period: string;
  }> {
    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // This would be expanded with more complex analytics queries
      const totalTransactions = await db
        .select({ count: count() })
        .from(creditTransactions)
        .where(gte(creditTransactions.createdAt, startDate));

      return {
        totalCreditsConsumed: 0, // TODO: Implement actual calculation
        totalTransactions: totalTransactions[0].count,
        featureBreakdown: {}, // TODO: Implement actual calculation
        dailyUsage: [], // TODO: Implement actual calculation
        period: `${days} days`,
        // Add more analytics as needed
      };
    } catch (error) {
      console.error('Error fetching credit analytics:', error);
      throw new CreditSystemError('Failed to fetch analytics', 'ANALYTICS_ERROR');
    }
  }
}
