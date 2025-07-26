import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditService } from '@/lib/services/credit-service';
import { CreditSystemError } from '@/lib/types/credit-types';
import { z } from 'zod';

// Request validation schema
const grantCreditsSchema = z.object({
  user_id: z.string(),
  amount: z.number().min(1).max(1000),
  reason: z.string().optional().default('admin_grant'),
});

export async function POST(request: NextRequest) {
  try {
    // Get admin session (you might want to add admin role checking here)
    const session = await auth.api.getSession({
      headers: request.headers
    });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // TODO: Add admin role verification
    // if (!session.user.isAdmin) {
    //   return NextResponse.json(
    //     { error: 'Forbidden - Admin access required' },
    //     { status: 403 }
    //   );
    // }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = grantCreditsSchema.parse(body);

    // Grant credits
    await CreditService.grantCredits(
      validatedData.user_id,
      validatedData.amount,
      validatedData.reason
    );

    // Get updated credit status
    const updatedCredits = await CreditService.getUserCredits(validatedData.user_id);

    return NextResponse.json({
      success: true,
      message: `Successfully granted ${validatedData.amount} credits to user ${validatedData.user_id}`,
      user_id: validatedData.user_id,
      credits_granted: validatedData.amount,
      new_balance: updatedCredits.remaining,
      reason: validatedData.reason,
    });

  } catch (error) {
    console.error('Grant credits API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

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
