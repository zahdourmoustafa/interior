import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditService } from '@/lib/services/credit-service';
import { CreditSystemError, InsufficientCreditsError } from '@/lib/types/credit-types';
import { z } from 'zod';

// Request validation schema
const consumeCreditSchema = z.object({
  feature: z.enum(['interior', 'exterior', 'sketch', 'furnish', 'remove', 'video', 'text']),
  generation_id: z.string().optional(),
  metadata: z.record(z.any()).optional(),
});

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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = consumeCreditSchema.parse(body);

    // Consume credit
    const result = await CreditService.consumeCredit(session.user.id, {
      feature: validatedData.feature,
      generationId: validatedData.generation_id,
      metadata: validatedData.metadata,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.message,
          remaining_credits: result.remainingCredits,
          can_proceed: result.canProceed,
          upgrade_required: true,
        },
        { status: 402 } // Payment Required
      );
    }

    return NextResponse.json({
      success: true,
      remaining_credits: result.remainingCredits,
      message: result.message,
      unlimited: result.remainingCredits === -1,
    });

  } catch (error) {
    console.error('Credit consumption API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request data',
          details: error.errors 
        },
        { status: 400 }
      );
    }

    if (error instanceof InsufficientCreditsError) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
          remaining_credits: error.remainingCredits,
          required_credits: error.requiredCredits,
          upgrade_required: true,
        },
        { status: 402 }
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
