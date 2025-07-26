import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { CreditService } from '@/lib/services/credit-service';
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Get credit history
    const history = await CreditService.getCreditHistory(session.user.id, limit);

    return NextResponse.json({
      transactions: history.transactions.map(t => ({
        id: t.id,
        feature_used: t.featureUsed,
        credits_consumed: t.creditsConsumed,
        generation_id: t.generationId,
        metadata: t.metadata,
        created_at: t.createdAt.toISOString(),
      })),
      total_consumed: history.totalConsumed,
      most_used_feature: history.mostUsedFeature,
      average_daily: Math.round(history.averageDaily * 100) / 100,
    });

  } catch (error) {
    console.error('Credit history API error:', error);
    
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
