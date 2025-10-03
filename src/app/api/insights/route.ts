import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { insights, competitors } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const competitorId = searchParams.get('competitorId');
    const sentiment = searchParams.get('sentiment');
    const priority = searchParams.get('priority');
    const platform = searchParams.get('platform');
    const insightType = searchParams.get('insightType');
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const sort = searchParams.get('sort') || 'detectedAt';
    const order = searchParams.get('order') || 'desc';

    // Single record fetch
    const id = searchParams.get('id');
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(insights)
        .where(and(eq(insights.id, parseInt(id)), eq(insights.userId, user.id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // Build query conditions
    const conditions = [eq(insights.userId, user.id)];

    if (competitorId && !isNaN(parseInt(competitorId))) {
      // Verify competitor belongs to user
      const competitor = await db.select()
        .from(competitors)
        .where(and(eq(competitors.id, parseInt(competitorId)), eq(competitors.userId, user.id)))
        .limit(1);
      
      if (competitor.length === 0) {
        return NextResponse.json({ 
          error: 'Competitor not found or access denied',
          code: 'COMPETITOR_ACCESS_DENIED'
        }, { status: 403 });
      }

      conditions.push(eq(insights.competitorId, parseInt(competitorId)));
    }

    if (sentiment && ['threat', 'opportunity', 'neutral'].includes(sentiment)) {
      conditions.push(eq(insights.sentiment, sentiment));
    }

    if (priority && ['high', 'medium', 'low'].includes(priority)) {
      conditions.push(eq(insights.priority, priority));
    }

    if (platform) {
      conditions.push(eq(insights.platform, platform));
    }

    if (insightType && ['product_launch', 'feature_update', 'pricing_change', 'marketing_campaign', 'executive_hire', 'partnership', 'other'].includes(insightType)) {
      conditions.push(eq(insights.insightType, insightType));
    }

    if (from) {
      conditions.push(gte(insights.detectedAt, from));
    }

    if (to) {
      conditions.push(lte(insights.detectedAt, to));
    }

    if (search) {
      const searchCondition = or(
        like(insights.content, `%${search}%`),
        like(insights.summary, `%${search}%`)
      );
      conditions.push(searchCondition);
    }

    const orderBy = order === 'asc' ? asc : desc;
    const sortColumn = sort === 'createdAt' ? insights.createdAt : 
                      sort === 'priority' ? insights.priority :
                      sort === 'sentiment' ? insights.sentiment :
                      insights.detectedAt;

    const results = await db.select()
      .from(insights)
      .where(and(...conditions))
      .orderBy(orderBy(sortColumn))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results);

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

    const {
      competitorId,
      platform,
      content,
      summary,
      insightType,
      sentiment,
      priority = 'medium',
      keyPoints,
      recommendations,
      impact,
      tags,
      publicOpinion,
      sourceUrl,
      detectedAt
    } = requestBody;

    // Validate required fields
    if (!insightType) {
      return NextResponse.json({ 
        error: "Insight type is required",
        code: "MISSING_INSIGHT_TYPE" 
      }, { status: 400 });
    }

    if (!sentiment) {
      return NextResponse.json({ 
        error: "Sentiment is required",
        code: "MISSING_SENTIMENT" 
      }, { status: 400 });
    }

    if (!detectedAt) {
      return NextResponse.json({ 
        error: "Detected at timestamp is required",
        code: "MISSING_DETECTED_AT" 
      }, { status: 400 });
    }

    if (!competitorId || isNaN(parseInt(competitorId))) {
      return NextResponse.json({ 
        error: "Valid competitor ID is required",
        code: "INVALID_COMPETITOR_ID" 
      }, { status: 400 });
    }

    // Validate insightType values
    const validInsightTypes = ['product_launch', 'feature_update', 'pricing_change', 'marketing_campaign', 'executive_hire', 'partnership', 'other'];
    if (!validInsightTypes.includes(insightType)) {
      return NextResponse.json({ 
        error: "Invalid insight type. Must be one of: " + validInsightTypes.join(', '),
        code: "INVALID_INSIGHT_TYPE" 
      }, { status: 400 });
    }

    // Validate sentiment values
    const validSentiments = ['threat', 'opportunity', 'neutral'];
    if (!validSentiments.includes(sentiment)) {
      return NextResponse.json({ 
        error: "Invalid sentiment. Must be one of: " + validSentiments.join(', '),
        code: "INVALID_SENTIMENT" 
      }, { status: 400 });
    }

    // Validate priority values
    const validPriorities = ['high', 'medium', 'low'];
    if (priority && !validPriorities.includes(priority)) {
      return NextResponse.json({ 
        error: "Invalid priority. Must be one of: " + validPriorities.join(', '),
        code: "INVALID_PRIORITY" 
      }, { status: 400 });
    }

    // Verify competitor belongs to user
    const competitor = await db.select()
      .from(competitors)
      .where(and(eq(competitors.id, parseInt(competitorId)), eq(competitors.userId, user.id)))
      .limit(1);
    
    if (competitor.length === 0) {
      return NextResponse.json({ 
        error: 'Competitor not found or access denied',
        code: 'COMPETITOR_ACCESS_DENIED'
      }, { status: 403 });
    }

    const insertData = {
      userId: user.id,
      competitorId: parseInt(competitorId),
      platform: platform?.trim() || null,
      content: content?.trim() || null,
      summary: summary?.trim() || null,
      insightType,
      sentiment,
      priority,
      keyPoints: keyPoints || null,
      recommendations: recommendations || null,
      impact: impact?.trim() || null,
      tags: tags || null,
      publicOpinion: publicOpinion || null,
      sourceUrl: sourceUrl?.trim() || null,
      detectedAt,
      createdAt: new Date().toISOString()
    };

    const newInsight = await db.insert(insights)
      .values(insertData)
      .returning();

    return NextResponse.json(newInsight[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Check record exists and belongs to user
    const existingRecord = await db.select()
      .from(insights)
      .where(and(eq(insights.id, parseInt(id)), eq(insights.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    const {
      competitorId,
      platform,
      content,
      summary,
      insightType,
      sentiment,
      priority,
      keyPoints,
      recommendations,
      impact,
      tags,
      publicOpinion,
      sourceUrl,
      detectedAt
    } = requestBody;

    // Validate insightType if provided
    if (insightType) {
      const validInsightTypes = ['product_launch', 'feature_update', 'pricing_change', 'marketing_campaign', 'executive_hire', 'partnership', 'other'];
      if (!validInsightTypes.includes(insightType)) {
        return NextResponse.json({ 
          error: "Invalid insight type. Must be one of: " + validInsightTypes.join(', '),
          code: "INVALID_INSIGHT_TYPE" 
        }, { status: 400 });
      }
    }

    // Validate sentiment if provided
    if (sentiment) {
      const validSentiments = ['threat', 'opportunity', 'neutral'];
      if (!validSentiments.includes(sentiment)) {
        return NextResponse.json({ 
          error: "Invalid sentiment. Must be one of: " + validSentiments.join(', '),
          code: "INVALID_SENTIMENT" 
        }, { status: 400 });
      }
    }

    // Validate priority if provided
    if (priority) {
      const validPriorities = ['high', 'medium', 'low'];
      if (!validPriorities.includes(priority)) {
        return NextResponse.json({ 
          error: "Invalid priority. Must be one of: " + validPriorities.join(', '),
          code: "INVALID_PRIORITY" 
        }, { status: 400 });
      }
    }

    // Validate competitorId if provided
    if (competitorId) {
      if (isNaN(parseInt(competitorId))) {
        return NextResponse.json({ 
          error: "Valid competitor ID is required",
          code: "INVALID_COMPETITOR_ID" 
        }, { status: 400 });
      }

      const competitor = await db.select()
        .from(competitors)
        .where(and(eq(competitors.id, parseInt(competitorId)), eq(competitors.userId, user.id)))
        .limit(1);
      
      if (competitor.length === 0) {
        return NextResponse.json({ 
          error: 'Competitor not found or access denied',
          code: 'COMPETITOR_ACCESS_DENIED'
        }, { status: 403 });
      }
    }

    const updates: any = {
      updatedAt: new Date().toISOString()
    };

    if (competitorId !== undefined) updates.competitorId = parseInt(competitorId);
    if (platform !== undefined) updates.platform = platform?.trim() || null;
    if (content !== undefined) updates.content = content?.trim() || null;
    if (summary !== undefined) updates.summary = summary?.trim() || null;
    if (insightType !== undefined) updates.insightType = insightType;
    if (sentiment !== undefined) updates.sentiment = sentiment;
    if (priority !== undefined) updates.priority = priority;
    if (keyPoints !== undefined) updates.keyPoints = keyPoints;
    if (recommendations !== undefined) updates.recommendations = recommendations;
    if (impact !== undefined) updates.impact = impact?.trim() || null;
    if (tags !== undefined) updates.tags = tags;
    if (publicOpinion !== undefined) updates.publicOpinion = publicOpinion;
    if (sourceUrl !== undefined) updates.sourceUrl = sourceUrl?.trim() || null;
    if (detectedAt !== undefined) updates.detectedAt = detectedAt;

    const updated = await db.update(insights)
      .set(updates)
      .where(and(eq(insights.id, parseInt(id)), eq(insights.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    return NextResponse.json(updated[0]);

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json({ 
        error: "Valid ID is required",
        code: "INVALID_ID" 
      }, { status: 400 });
    }

    // Check record exists and belongs to user before deleting
    const existingRecord = await db.select()
      .from(insights)
      .where(and(eq(insights.id, parseInt(id)), eq(insights.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    const deleted = await db.delete(insights)
      .where(and(eq(insights.id, parseInt(id)), eq(insights.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Insight not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Insight deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}