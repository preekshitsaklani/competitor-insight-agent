import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { socialAccounts, competitors } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required' 
      }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const socialAccountId = parseInt(id);

    // First, get the social account and check if it exists and belongs to user's competitor
    const socialAccountQuery = await db
      .select({
        socialAccount: socialAccounts,
        competitor: competitors
      })
      .from(socialAccounts)
      .innerJoin(competitors, eq(socialAccounts.competitorId, competitors.id))
      .where(
        and(
          eq(socialAccounts.id, socialAccountId),
          eq(competitors.userId, user.id)
        )
      )
      .limit(1);

    if (socialAccountQuery.length === 0) {
      return NextResponse.json({ 
        error: 'Social account not found or unauthorized access',
        code: "SOCIAL_ACCOUNT_NOT_FOUND" 
      }, { status: 404 });
    }

    // Delete the social account
    const deleted = await db.delete(socialAccounts)
      .where(
        and(
          eq(socialAccounts.id, socialAccountId),
          eq(socialAccounts.competitorId, socialAccountQuery[0].competitor.id)
        )
      )
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ 
        error: 'Social account not found',
        code: "SOCIAL_ACCOUNT_NOT_FOUND" 
      }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Social account deleted successfully',
      deletedSocialAccount: {
        id: deleted[0].id,
        platform: deleted[0].platform,
        handle: deleted[0].handle,
        competitorName: socialAccountQuery[0].competitor.name
      }
    }, { status: 200 });

  } catch (error) {
    console.error('DELETE social account error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}