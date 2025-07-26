import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditService } from '@/lib/services/credit-service';
import { FeatureType } from '@/lib/types/credit-types';

/**
 * Middleware to check if user has sufficient credits before proceeding with generation
 */
export async function creditCheckMiddleware(
  request: NextRequest,
  feature: FeatureType
): Promise<NextResponse | null> {
  try {
    // Get user session
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has sufficient credits
    const hasCredits = await CreditService.validateCreditUsage(session.user.id);

    if (!hasCredits) {
      // Get current credit status for detailed response
      const credits = await CreditService.getUserCredits(session.user.id);
      
      return NextResponse.json(
        {
          error: 'Insufficient credits',
          remaining_credits: credits.remaining,
          subscription_status: credits.subscriptionStatus,
          upgrade_required: true,
          feature_attempted: feature,
        },
        { status: 402 } // Payment Required
      );
    }

    // User has sufficient credits, allow request to proceed
    return null;
  } catch (error) {
    console.error('Credit check middleware error:', error);
    
    return NextResponse.json(
      { error: 'Credit system error' },
      { status: 500 }
    );
  }
}

/**
 * Helper function to wrap generation endpoints with credit checking
 */
export function withCreditCheck(
  feature: FeatureType,
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    // Check credits first
    const creditCheckResult = await creditCheckMiddleware(request, feature);
    
    if (creditCheckResult) {
      // Credit check failed, return the error response
      return creditCheckResult;
    }

    // Credits are sufficient, proceed with the original handler
    return handler(request);
  };
}

/**
 * Helper to consume credit after successful generation
 */
export async function consumeCreditAfterGeneration(
  userId: string,
  feature: FeatureType,
  generationId?: string,
  metadata?: Record<string, any>
): Promise<void> {
  try {
    await CreditService.consumeCredit(userId, {
      feature,
      generationId,
      metadata,
    });
  } catch (error) {
    console.error('Error consuming credit after generation:', error);
    // Log error but don't fail the generation
    // Credits can be manually adjusted if needed
  }
}
