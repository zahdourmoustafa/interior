import { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditService } from '@/lib/services/credit-service';
import { FeatureType } from '@/lib/types/credit-types';

/**
 * Utility to check and consume credits for generation endpoints
 */
export class CreditIntegration {
  /**
   * Check if user has credits and consume them if successful
   */
  static async checkAndConsumeCredit(
    request: NextRequest,
    feature: FeatureType,
    generationId?: string,
    metadata?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    userId?: string;
    remainingCredits?: number;
    error?: string;
    upgradeRequired?: boolean;
  }> {
    try {
      // Get user session
      const session = await auth.api.getSession({
        headers: request.headers
      });

      if (!session?.user) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      // Check if user has sufficient credits
      const hasCredits = await CreditService.validateCreditUsage(session.user.id);

      if (!hasCredits) {
        const credits = await CreditService.getUserCredits(session.user.id);
        return {
          success: false,
          userId: session.user.id,
          remainingCredits: credits.remaining,
          error: 'Insufficient credits',
          upgradeRequired: true,
        };
      }

      // Consume the credit
      const result = await CreditService.consumeCredit(session.user.id, {
        feature,
        generationId,
        metadata,
      });

      if (!result.success) {
        return {
          success: false,
          userId: session.user.id,
          remainingCredits: result.remainingCredits,
          error: result.message,
          upgradeRequired: true,
        };
      }

      return {
        success: true,
        userId: session.user.id,
        remainingCredits: result.remainingCredits,
      };

    } catch (error) {
      console.error('Credit integration error:', error);
      return {
        success: false,
        error: 'Credit system error',
      };
    }
  }

  /**
   * Get user's current credit status
   */
  static async getUserCreditStatus(request: NextRequest): Promise<{
    success: boolean;
    userId?: string;
    credits?: {
      remaining: number;
      total: number;
      subscriptionStatus: string;
      unlimited: boolean;
    };
    error?: string;
  }> {
    try {
      const session = await auth.api.getSession({
        headers: request.headers
      });

      if (!session?.user) {
        return {
          success: false,
          error: 'Unauthorized',
        };
      }

      const credits = await CreditService.getUserCredits(session.user.id);

      return {
        success: true,
        userId: session.user.id,
        credits: {
          remaining: credits.remaining,
          total: credits.total,
          subscriptionStatus: credits.subscriptionStatus,
          unlimited: credits.subscriptionStatus === 'pro' || credits.subscriptionStatus === 'expert',
        },
      };

    } catch (error) {
      console.error('Error getting credit status:', error);
      return {
        success: false,
        error: 'Failed to get credit status',
      };
    }
  }

  /**
   * Helper to create standardized error responses for insufficient credits
   */
  static createInsufficientCreditsResponse(remainingCredits: number, feature: FeatureType) {
    return {
      error: 'Insufficient credits',
      remaining_credits: remainingCredits,
      feature_attempted: feature,
      upgrade_required: true,
      message: `You need credits to use ${feature}. Please upgrade your plan to continue.`,
      upgrade_url: '/checkout', // Link to subscription page
    };
  }

  /**
   * Helper to create success response after credit consumption
   */
  static createSuccessResponse(remainingCredits: number, unlimited: boolean = false) {
    return {
      success: true,
      remaining_credits: unlimited ? -1 : remainingCredits,
      unlimited,
      message: unlimited ? 'Generation successful (unlimited)' : `Generation successful. ${remainingCredits} credits remaining.`,
    };
  }
}

/**
 * Decorator function to wrap generation endpoints with credit checking
 */
export function withCreditCheck(feature: FeatureType) {
  return function (
    target: unknown,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;

    descriptor.value = async function (request: NextRequest, ...args: unknown[]) {
      // Check and consume credit
      const creditResult = await CreditIntegration.checkAndConsumeCredit(
        request,
        feature
      );

      if (!creditResult.success) {
        const response = CreditIntegration.createInsufficientCreditsResponse(
          creditResult.remainingCredits || 0,
          feature
        );

        return Response.json(response, { 
          status: creditResult.error === 'Unauthorized' ? 401 : 402 
        });
      }

      // Proceed with original method
      const result = await method.apply(this, [request, ...args]);
      
      return result;
    };
  };
}
