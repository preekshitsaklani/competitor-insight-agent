import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSentimentData } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { 
          error: 'Authentication required',
          code: 'AUTHENTICATION_REQUIRED' 
        },
        { status: 401 }
      );
    }

    // Query for the most recent sentiment data for the authenticated user
    const result = await db
      .select()
      .from(userSentimentData)
      .where(eq(userSentimentData.userId, user.id))
      .orderBy(desc(userSentimentData.scrapedAt))
      .limit(1);

    // Return the single most recent record or null if none exists
    const sentimentData = result.length > 0 ? result[0] : null;

    return NextResponse.json({ sentimentData }, { status: 200 });
  } catch (error) {
    console.error('GET sentiment data error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_SERVER_ERROR' 
      },
      { status: 500 }
    );
  }
}