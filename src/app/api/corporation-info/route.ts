import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { corporationInfo } from '@/db/schema';
import { eq, like, and, or, desc } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: 'Valid ID is required',
          code: 'INVALID_ID' 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(corporationInfo)
        .where(and(eq(corporationInfo.id, parseInt(id)), eq(corporationInfo.userId, user.id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Record not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with filtering and pagination
    let query = db.select().from(corporationInfo);
    
    // Always scope to authenticated user
    let whereConditions = [eq(corporationInfo.userId, user.id)];

    // Add search conditions
    if (search) {
      const searchCondition = or(
        like(corporationInfo.companyDescription, `%${search}%`),
        like(corporationInfo.industry, `%${search}%`)
      );
      whereConditions.push(searchCondition);
    }

    query = query.where(and(...whereConditions));

    // Add sorting
    if (sort === 'createdAt') {
      query = query.orderBy(order === 'desc' ? desc(corporationInfo.createdAt) : corporationInfo.createdAt);
    } else if (sort === 'updatedAt') {
      query = query.orderBy(order === 'desc' ? desc(corporationInfo.updatedAt) : corporationInfo.updatedAt);
    }

    const results = await query.limit(limit).offset(offset);
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

    const { companySize, companyDescription, industry, topEmployees } = requestBody;

    // Validate companySize if provided
    if (companySize !== null && companySize !== undefined) {
      if (!Number.isInteger(companySize) || companySize <= 0) {
        return NextResponse.json({ 
          error: "Company size must be a positive integer",
          code: "INVALID_COMPANY_SIZE" 
        }, { status: 400 });
      }
    }

    // Validate topEmployees JSON if provided
    let parsedTopEmployees = null;
    if (topEmployees !== null && topEmployees !== undefined) {
      try {
        if (typeof topEmployees === 'string') {
          parsedTopEmployees = JSON.parse(topEmployees);
        } else {
          parsedTopEmployees = topEmployees;
        }
        
        if (!Array.isArray(parsedTopEmployees)) {
          return NextResponse.json({ 
            error: "Top employees must be a valid JSON array",
            code: "INVALID_TOP_EMPLOYEES_FORMAT" 
          }, { status: 400 });
        }
      } catch (jsonError) {
        return NextResponse.json({ 
          error: "Top employees must be valid JSON",
          code: "INVALID_TOP_EMPLOYEES_JSON" 
        }, { status: 400 });
      }
    }

    // Check if user already has corporation info (unique constraint)
    const existing = await db.select()
      .from(corporationInfo)
      .where(eq(corporationInfo.userId, user.id))
      .limit(1);

    if (existing.length > 0) {
      return NextResponse.json({ 
        error: "Corporation info already exists for this user",
        code: "CORPORATION_INFO_EXISTS" 
      }, { status: 400 });
    }

    const now = new Date();
    const insertData = {
      userId: user.id,
      companySize: companySize || null,
      companyDescription: companyDescription?.trim() || null,
      industry: industry?.trim() || null,
      topEmployees: parsedTopEmployees,
      createdAt: now,
      updatedAt: now,
    };

    const newRecord = await db.insert(corporationInfo)
      .values(insertData)
      .returning();

    return NextResponse.json(newRecord[0], { status: 201 });

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
      .from(corporationInfo)
      .where(and(eq(corporationInfo.id, parseInt(id)), eq(corporationInfo.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const { companySize, companyDescription, industry, topEmployees } = requestBody;
    const updates: any = {};

    // Validate and set companySize if provided
    if (companySize !== undefined) {
      if (companySize !== null && (!Number.isInteger(companySize) || companySize <= 0)) {
        return NextResponse.json({ 
          error: "Company size must be a positive integer",
          code: "INVALID_COMPANY_SIZE" 
        }, { status: 400 });
      }
      updates.companySize = companySize;
    }

    // Set company description if provided
    if (companyDescription !== undefined) {
      updates.companyDescription = companyDescription?.trim() || null;
    }

    // Set industry if provided
    if (industry !== undefined) {
      updates.industry = industry?.trim() || null;
    }

    // Validate and set topEmployees if provided
    if (topEmployees !== undefined) {
      if (topEmployees !== null) {
        try {
          let parsedTopEmployees;
          if (typeof topEmployees === 'string') {
            parsedTopEmployees = JSON.parse(topEmployees);
          } else {
            parsedTopEmployees = topEmployees;
          }
          
          if (!Array.isArray(parsedTopEmployees)) {
            return NextResponse.json({ 
              error: "Top employees must be a valid JSON array",
              code: "INVALID_TOP_EMPLOYEES_FORMAT" 
            }, { status: 400 });
          }
          
          updates.topEmployees = parsedTopEmployees;
        } catch (jsonError) {
          return NextResponse.json({ 
            error: "Top employees must be valid JSON",
            code: "INVALID_TOP_EMPLOYEES_JSON" 
          }, { status: 400 });
        }
      } else {
        updates.topEmployees = null;
      }
    }

    // Always update updatedAt
    updates.updatedAt = new Date();

    const updated = await db.update(corporationInfo)
      .set(updates)
      .where(and(eq(corporationInfo.id, parseInt(id)), eq(corporationInfo.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
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
      .from(corporationInfo)
      .where(and(eq(corporationInfo.id, parseInt(id)), eq(corporationInfo.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    const deleted = await db.delete(corporationInfo)
      .where(and(eq(corporationInfo.id, parseInt(id)), eq(corporationInfo.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Corporation info deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}