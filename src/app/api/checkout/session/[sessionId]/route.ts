import { NextRequest, NextResponse } from 'next/server'
import { creem } from '@/lib/creem'

interface RouteParams {
  params: Promise<{
    sessionId: string
  }>
}

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { sessionId } = await params

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      )
    }

    // Fetch session details from Creem
    const session = await creem.getCheckoutSession(sessionId)

    return NextResponse.json({
      id: session.id,
      status: session.status,
      mode: session.mode,
      url: session.url,
    })
  } catch (error) {
    console.error('Session fetch error:', error)
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    
    return NextResponse.json(
      { error: 'Failed to fetch session details', details: errorMessage },
      { status: 500 }
    )
  }
} 