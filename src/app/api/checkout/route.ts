import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { creem } from '@/lib/creem';
import { siteConfig } from '@/lib/config';

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

    const body = await request.json();
    const { planId, isYearly } = body;

    // Validate required fields
    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      );
    }

    // Find the plan from config
    const plan = siteConfig.pricing.find(
      p => p.name.toLowerCase().replace(' ', '_') === planId
    );

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      );
    }

    // Convert plan to checkout data
    const checkoutData = creem.planToCheckoutData(plan, isYearly || false);
    
    // Add user context for webhook handling
    checkoutData.customerEmail = session.user.email;
    
    // Set success and cancel URLs with user context
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    checkoutData.successUrl = `${baseUrl}/checkout/success?plan=${planId}&yearly=${isYearly}`;
    checkoutData.cancelUrl = `${baseUrl}/checkout/canceled`;

    // Create checkout session with enhanced metadata
    const session_data = {
      ...checkoutData,
      metadata: {
        user_id: session.user.id,
        user_email: session.user.email,
        plan_id: planId,
        plan_name: plan.name,
        billing_type: isYearly ? 'yearly' : 'monthly',
        created_at: new Date().toISOString(),
      }
    };

    // Create checkout session
    const checkoutSession = await creem.createCheckoutSession(session_data);

    console.log('✅ Checkout session created:', {
      sessionId: checkoutSession.id,
      userId: session.user.id,
      planId,
      isYearly
    });

    return NextResponse.json({
      sessionId: checkoutSession.id,
      url: checkoutSession.url,
      planId,
      planName: plan.name,
      isYearly,
    });
  } catch (error) {
    console.error('❌ Checkout error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: errorMessage },
      { status: 500 }
    );
  }
}
