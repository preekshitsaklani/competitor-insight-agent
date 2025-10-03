import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { competitors } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
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

    const competitor = await db.select()
      .from(competitors)
      .where(and(eq(competitors.id, parseInt(id)), eq(competitors.userId, user.id)))
      .limit(1);

    if (competitor.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
    }

    return NextResponse.json(competitor[0]);
  } catch (error) {
    console.error('GET error:', error);
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

    // Validate status if provided
    if (requestBody.status && !['active', 'paused'].includes(requestBody.status)) {
      return NextResponse.json({ 
        error: "Status must be 'active' or 'paused'",
        code: "INVALID_STATUS" 
      }, { status: 400 });
    }

    // Validate monitoringFrequency if provided
    if (requestBody.monitoringFrequency && !['realtime', 'daily', 'weekly'].includes(requestBody.monitoringFrequency)) {
      return NextResponse.json({ 
        error: "Monitoring frequency must be 'realtime', 'daily', or 'weekly'",
        code: "INVALID_MONITORING_FREQUENCY" 
      }, { status: 400 });
    }

    // Check if competitor exists and belongs to user
    const existingCompetitor = await db.select()
      .from(competitors)
      .where(and(eq(competitors.id, parseInt(id)), eq(competitors.userId, user.id)))
      .limit(1);

    if (existingCompetitor.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      ...requestBody,
      updatedAt: new Date().toISOString()
    };

    // Remove any fields that shouldn't be updated
    delete updateData.id;
    delete updateData.userId;
    delete updateData.user_id;
    delete updateData.createdAt;

    const updated = await db.update(competitors)
      .set(updateData)
      .where(and(eq(competitors.id, parseInt(id)), eq(competitors.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
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

    // Check if competitor exists and belongs to user before deleting
    const existingCompetitor = await db.select()
      .from(competitors)
      .where(and(eq(competitors.id, parseInt(id)), eq(competitors.userId, user.id)))
      .limit(1);

    if (existingCompetitor.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
    }

    const deleted = await db.delete(competitors)
      .where(and(eq(competitors.id, parseInt(id)), eq(competitors.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Competitor not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Competitor deleted successfully',
      deletedCompetitor: deleted[0]
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}