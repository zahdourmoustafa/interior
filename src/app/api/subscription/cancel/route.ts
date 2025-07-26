import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
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

    const userId = session.user.id;

    console.log('🔄 Cancelling subscription for user:', userId);

    // In a real implementation, you would:
    // 1. Get user's current subscription from database
    // 2. Cancel the subscription with Creem
    // 3. Update user's credits to 0
    // 4. Update subscription status in database

    // For now, we'll simulate the cancellation by setting credits to 0
    try {
      // Update user credits to 0
      await db
        .update(users)
        .set({
          creditsRemaining: 0, // Use correct field name
          subscriptionStatus: 'cancelled',
          subscriptionId: null,
          updatedAt: new Date()
        })
        .where(eq(users.id, userId));

      console.log('✅ Subscription cancelled successfully for user:', userId);

      return NextResponse.json({
        success: true,
        message: 'Subscription cancelled successfully',
        credits: 0
      });

    } catch (dbError) {
      console.error('❌ Database error during cancellation:', dbError);
      throw new Error('Failed to update user data');
    }

  } catch (error) {
    console.error('❌ Subscription cancellation error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: errorMessage },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current subscription info
export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get user's subscription info from database
    let user;
    try {
      const result = await db
        .select({
          credits: users.creditsRemaining, // Map to correct field name
          subscriptionStatus: users.subscriptionStatus,
          subscriptionId: users.subscriptionId,
          planId: users.planId
        })
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);
      
      user = result[0];
    } catch (dbError) {
      console.error('❌ Database query error:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    if (!user) {
      console.log('⚠️ User not found in database:', userId);
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user has an active subscription
    const hasActiveSubscription = user.subscriptionStatus === 'active' && 
                                 user.subscriptionId && 
                                 user.planId && 
                                 user.planId !== 'free';

    if (!hasActiveSubscription) {
      // User is on free plan - return null to indicate no subscription
      return NextResponse.json(null);
    }

    // User has active subscription - return subscription data
    const subscriptionData = {
      planId: user.planId,
      status: user.subscriptionStatus,
      billingCycle: 'monthly', // This would come from Creem API in real implementation
      nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      cancelAtPeriodEnd: false,
      credits: user.credits || 0
    };

    return NextResponse.json(subscriptionData);

  } catch (error) {
    console.error('❌ Get subscription error:', error);
    
    return NextResponse.json(
      { error: 'Failed to get subscription info' },
      { status: 500 }
    );
  }
}
