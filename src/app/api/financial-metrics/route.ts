import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { financialMetrics } from '@/db/schema';
import { eq, like, and, or, desc, asc, gte, lte } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    // Single record fetch
    if (id) {
      if (!id || isNaN(parseInt(id))) {
        return NextResponse.json({ 
          error: "Valid ID is required",
          code: "INVALID_ID" 
        }, { status: 400 });
      }

      const record = await db.select()
        .from(financialMetrics)
        .where(and(eq(financialMetrics.id, parseInt(id)), eq(financialMetrics.userId, user.id)))
        .limit(1);

      if (record.length === 0) {
        return NextResponse.json({ error: 'Financial metric not found' }, { status: 404 });
      }

      return NextResponse.json(record[0]);
    }

    // List with pagination and filtering
    const limit = Math.min(parseInt(searchParams.get('limit') || '10'), 100);
    const offset = parseInt(searchParams.get('offset') || '0');
    const month = searchParams.get('month');
    const fromMonth = searchParams.get('fromMonth');
    const toMonth = searchParams.get('toMonth');
    const sort = searchParams.get('sort') || 'createdAt';
    const order = searchParams.get('order') || 'desc';

    let query = db.select().from(financialMetrics);
    let conditions = [eq(financialMetrics.userId, user.id)];

    // Month filtering
    if (month) {
      conditions.push(eq(financialMetrics.month, month));
    }

    // Date range filtering
    if (fromMonth) {
      conditions.push(gte(financialMetrics.month, fromMonth));
    }
    if (toMonth) {
      conditions.push(lte(financialMetrics.month, toMonth));
    }

    query = query.where(and(...conditions));

    // Sorting
    const orderBy = order === 'asc' ? asc : desc;
    if (sort === 'month') {
      query = query.orderBy(orderBy(financialMetrics.month));
    } else if (sort === 'createdAt') {
      query = query.orderBy(orderBy(financialMetrics.createdAt));
    } else {
      query = query.orderBy(orderBy(financialMetrics.createdAt));
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
    const { month, expenses, marketing, totalRevenue, profit } = requestBody;

    // Security check: reject if userId provided in body
    if ('userId' in requestBody || 'user_id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Validate required fields
    if (!month) {
      return NextResponse.json({ 
        error: "Month is required",
        code: "MISSING_MONTH" 
      }, { status: 400 });
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return NextResponse.json({ 
        error: "Month must be in YYYY-MM format",
        code: "INVALID_MONTH_FORMAT" 
      }, { status: 400 });
    }

    // Check for duplicate month per user
    const existingRecord = await db.select()
      .from(financialMetrics)
      .where(and(eq(financialMetrics.userId, user.id), eq(financialMetrics.month, month)))
      .limit(1);

    if (existingRecord.length > 0) {
      return NextResponse.json({ 
        error: "Financial metrics for this month already exist",
        code: "DUPLICATE_MONTH" 
      }, { status: 400 });
    }

    // Validate numeric fields
    const expensesValue = expenses !== undefined ? parseInt(expenses) : 0;
    const marketingValue = marketing !== undefined ? parseInt(marketing) : 0;
    const totalRevenueValue = totalRevenue !== undefined ? parseInt(totalRevenue) : 0;
    const profitValue = profit !== undefined ? parseInt(profit) : 0;

    if (isNaN(expensesValue) || isNaN(marketingValue) || isNaN(totalRevenueValue) || isNaN(profitValue)) {
      return NextResponse.json({ 
        error: "All financial values must be valid integers",
        code: "INVALID_NUMERIC_VALUES" 
      }, { status: 400 });
    }

    const now = new Date();
    const newRecord = await db.insert(financialMetrics)
      .values({
        userId: user.id,
        month,
        expenses: expensesValue,
        marketing: marketingValue,
        totalRevenue: totalRevenueValue,
        profit: profitValue,
        createdAt: now,
        updatedAt: now
      })
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

    // Check if record exists and belongs to user
    const existingRecord = await db.select()
      .from(financialMetrics)
      .where(and(eq(financialMetrics.id, parseInt(id)), eq(financialMetrics.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Financial metric not found' }, { status: 404 });
    }

    const updates: any = { updatedAt: new Date() };

    // Validate and update month if provided
    if (requestBody.month !== undefined) {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(requestBody.month)) {
        return NextResponse.json({ 
          error: "Month must be in YYYY-MM format",
          code: "INVALID_MONTH_FORMAT" 
        }, { status: 400 });
      }

      // Check for duplicate month per user (excluding current record)
      const duplicateRecord = await db.select()
        .from(financialMetrics)
        .where(and(
          eq(financialMetrics.userId, user.id), 
          eq(financialMetrics.month, requestBody.month),
          eq(financialMetrics.id, parseInt(id))
        ))
        .limit(1);

      if (duplicateRecord.length === 0) {
        const existingMonth = await db.select()
          .from(financialMetrics)
          .where(and(eq(financialMetrics.userId, user.id), eq(financialMetrics.month, requestBody.month)))
          .limit(1);

        if (existingMonth.length > 0) {
          return NextResponse.json({ 
            error: "Financial metrics for this month already exist",
            code: "DUPLICATE_MONTH" 
          }, { status: 400 });
        }
      }

      updates.month = requestBody.month;
    }

    // Validate and update numeric fields if provided
    if (requestBody.expenses !== undefined) {
      const expensesValue = parseInt(requestBody.expenses);
      if (isNaN(expensesValue)) {
        return NextResponse.json({ 
          error: "Expenses must be a valid integer",
          code: "INVALID_EXPENSES" 
        }, { status: 400 });
      }
      updates.expenses = expensesValue;
    }

    if (requestBody.marketing !== undefined) {
      const marketingValue = parseInt(requestBody.marketing);
      if (isNaN(marketingValue)) {
        return NextResponse.json({ 
          error: "Marketing must be a valid integer",
          code: "INVALID_MARKETING" 
        }, { status: 400 });
      }
      updates.marketing = marketingValue;
    }

    if (requestBody.totalRevenue !== undefined) {
      const totalRevenueValue = parseInt(requestBody.totalRevenue);
      if (isNaN(totalRevenueValue)) {
        return NextResponse.json({ 
          error: "Total revenue must be a valid integer",
          code: "INVALID_TOTAL_REVENUE" 
        }, { status: 400 });
      }
      updates.totalRevenue = totalRevenueValue;
    }

    if (requestBody.profit !== undefined) {
      const profitValue = parseInt(requestBody.profit);
      if (isNaN(profitValue)) {
        return NextResponse.json({ 
          error: "Profit must be a valid integer",
          code: "INVALID_PROFIT" 
        }, { status: 400 });
      }
      updates.profit = profitValue;
    }

    const updated = await db.update(financialMetrics)
      .set(updates)
      .where(and(eq(financialMetrics.id, parseInt(id)), eq(financialMetrics.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Financial metric not found' }, { status: 404 });
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

    // Check if record exists and belongs to user
    const existingRecord = await db.select()
      .from(financialMetrics)
      .where(and(eq(financialMetrics.id, parseInt(id)), eq(financialMetrics.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json({ error: 'Financial metric not found' }, { status: 404 });
    }

    const deleted = await db.delete(financialMetrics)
      .where(and(eq(financialMetrics.id, parseInt(id)), eq(financialMetrics.userId, user.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Financial metric not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Financial metric deleted successfully',
      deletedRecord: deleted[0]
    });

  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}