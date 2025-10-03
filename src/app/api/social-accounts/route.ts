import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { socialAccounts, competitors } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

const VALID_PLATFORMS = ['linkedin', 'twitter', 'facebook', 'instagram', 'reddit', 'bluesky', 'truthsocial'];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const competitorId = searchParams.get('competitorId');

    // If competitorId is provided, validate it belongs to the user
    if (competitorId) {
      const competitorIdNum = parseInt(competitorId);
      if (isNaN(competitorIdNum)) {
        return NextResponse.json({ 
          error: 'Invalid competitor ID',
          code: 'INVALID_COMPETITOR_ID' 
        }, { status: 400 });
      }

      // Verify competitor exists and belongs to user
      const competitor = await db.select()
        .from(competitors)
        .where(and(eq(competitors.id, competitorIdNum), eq(competitors.userId, user.id)))
        .limit(1);

      if (competitor.length === 0) {
        return NextResponse.json({ 
          error: 'Competitor not found or unauthorized',
          code: 'COMPETITOR_NOT_FOUND' 
        }, { status: 404 });
      }

      // Get social accounts for this competitor
      const socialAccountsList = await db.select({
        id: socialAccounts.id,
        competitorId: socialAccounts.competitorId,
        platform: socialAccounts.platform,
        handle: socialAccounts.handle,
        url: socialAccounts.url,
        isActive: socialAccounts.isActive,
        createdAt: socialAccounts.createdAt
      })
        .from(socialAccounts)
        .where(eq(socialAccounts.competitorId, competitorIdNum));

      return NextResponse.json(socialAccountsList);
    }

    // Get all social accounts for user's competitors
    const socialAccountsList = await db.select({
      id: socialAccounts.id,
      competitorId: socialAccounts.competitorId,
      platform: socialAccounts.platform,
      handle: socialAccounts.handle,
      url: socialAccounts.url,
      isActive: socialAccounts.isActive,
      createdAt: socialAccounts.createdAt
    })
      .from(socialAccounts)
      .innerJoin(competitors, eq(socialAccounts.competitorId, competitors.id))
      .where(eq(competitors.userId, user.id));

    return NextResponse.json(socialAccountsList);

  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { competitorId, platform, handle, url, isActive } = requestBody;

    // Validate required fields
    if (!competitorId) {
      return NextResponse.json({ 
        error: "Competitor ID is required",
        code: "MISSING_COMPETITOR_ID" 
      }, { status: 400 });
    }

    if (!platform) {
      return NextResponse.json({ 
        error: "Platform is required",
        code: "MISSING_PLATFORM" 
      }, { status: 400 });
    }

    if (!handle) {
      return NextResponse.json({ 
        error: "Handle is required",
        code: "MISSING_HANDLE" 
      }, { status: 400 });
    }

    // Validate competitorId is valid integer
    const competitorIdNum = parseInt(competitorId);
    if (isNaN(competitorIdNum)) {
      return NextResponse.json({ 
        error: "Valid competitor ID is required",
        code: "INVALID_COMPETITOR_ID" 
      }, { status: 400 });
    }

    // Validate platform
    if (!VALID_PLATFORMS.includes(platform.toLowerCase())) {
      return NextResponse.json({ 
        error: `Invalid platform. Must be one of: ${VALID_PLATFORMS.join(', ')}`,
        code: "INVALID_PLATFORM" 
      }, { status: 400 });
    }

    // Verify competitor exists and belongs to user
    const competitor = await db.select()
      .from(competitors)
      .where(and(eq(competitors.id, competitorIdNum), eq(competitors.userId, user.id)))
      .limit(1);

    if (competitor.length === 0) {
      return NextResponse.json({ 
        error: 'Competitor not found or unauthorized',
        code: 'COMPETITOR_NOT_FOUND' 
      }, { status: 403 });
    }

    // Sanitize inputs
    const sanitizedData = {
      competitorId: competitorIdNum,
      platform: platform.toLowerCase().trim(),
      handle: handle.trim(),
      url: url ? url.trim() : null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      createdAt: new Date().toISOString()
    };

    // Create social account
    const newSocialAccount = await db.insert(socialAccounts)
      .values(sanitizedData)
      .returning();

    return NextResponse.json(newSocialAccount[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}