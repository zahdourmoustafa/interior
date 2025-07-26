import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditService } from '@/lib/services/credit-service';
import { SubscriptionService } from '@/lib/services/subscription-service';
import { CreditSystemError } from '@/lib/types/credit-types';

export async function GET(request: NextRequest) {
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

    // Get user credits
    const credits = await CreditService.getUserCredits(session.user.id);
    
    // Get subscription information
    const subscription = await SubscriptionService.getUserSubscription(session.user.id);

    return NextResponse.json({
      remaining: credits.remaining,
      total: credits.total,
      subscription_status: credits.subscriptionStatus,
      last_updated: credits.lastUpdated.toISOString(),
      unlimited: subscription.hasUnlimitedCredits,
      plan_name: subscription.planName,
      is_active: subscription.isActive,
    });

  } catch (error) {
    console.error('Credits API error:', error);
    
    if (error instanceof CreditSystemError) {
      return NextResponse.json(
        { error: error.message, code: error.code },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
