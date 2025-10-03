import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { competitors } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');

    let query = db.select().from(competitors).where(eq(competitors.userId, user.id));

    if (search) {
      const searchTerm = `%${search.trim()}%`;
      query = query.where(
        and(
          eq(competitors.userId, user.id),
          or(
            like(competitors.name, searchTerm),
            like(competitors.industry, searchTerm)
          )
        )
      );
    }

    const results = await query
      .orderBy(desc(competitors.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });

    const requestBody = await request.json();

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { name, websiteUrl, logoUrl, industry, status, monitoringFrequency } = requestBody;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "MISSING_REQUIRED_FIELD" 
      }, { status: 400 });
    }

    // Validate status if provided
    if (status && !['active', 'paused'].includes(status)) {
      return NextResponse.json({ 
        error: "Status must be 'active' or 'paused'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate monitoringFrequency if provided
    if (monitoringFrequency && !['realtime', 'daily', 'weekly'].includes(monitoringFrequency)) {
      return NextResponse.json({ 
        error: "Monitoring frequency must be 'realtime', 'daily', or 'weekly'",
        code: "INVALID_MONITORING_FREQUENCY" 
      }, { status: 400 });
    }

    // Prepare data with defaults and sanitization
    const competitorData = {
      userId: user.id,
      name: name.trim(),
      websiteUrl: websiteUrl ? websiteUrl.trim() : null,
      logoUrl: logoUrl ? logoUrl.trim() : null,
      industry: industry ? industry.trim() : null,
      status: status || 'active',
      monitoringFrequency: monitoringFrequency || 'daily',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const newCompetitor = await db.insert(competitors)
      .values(competitorData)
      .returning();

    return NextResponse.json(newCompetitor[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}