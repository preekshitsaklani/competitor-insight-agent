import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { financialMetrics } from '@/db/schema';
import { eq, and, ne } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Authentication check
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Extract and validate ID
    const { id: idParam } = await params;
    const id = parseInt(idParam);
    
    if (!idParam || isNaN(id)) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { month, marketing, totalRevenue, expenses, profit } = body;

    // Security check: reject userId in request body
    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { 
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED' 
        },
        { status: 400 }
      );
    }

    // Check if record exists and belongs to user
    const existingRecord = await db
      .select()
      .from(financialMetrics)
      .where(and(eq(financialMetrics.id, id), eq(financialMetrics.userId, user.id)))
      .limit(1);

    if (existingRecord.length === 0) {
      return NextResponse.json(
        { error: 'Record not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate month format if provided (YYYY-MM)
    if (month !== undefined) {
      const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
      if (!monthRegex.test(month)) {
        return NextResponse.json(
          { 
            error: 'Invalid month format. Expected YYYY-MM',
            code: 'INVALID_MONTH_FORMAT' 
          },
          { status: 400 }
        );
      }

      // Check for duplicate month (exclude current record)
      const duplicateCheck = await db
        .select()
        .from(financialMetrics)
        .where(
          and(
            eq(financialMetrics.userId, user.id),
            eq(financialMetrics.month, month),
            ne(financialMetrics.id, id)
          )
        )
        .limit(1);

      if (duplicateCheck.length > 0) {
        return NextResponse.json(
          { 
            error: 'A record for this month already exists',
            code: 'DUPLICATE_MONTH' 
          },
          { status: 400 }
        );
      }
    }

    // Validate numeric fields if provided
    if (marketing !== undefined) {
      if (typeof marketing !== 'number' || !Number.isInteger(marketing)) {
        return NextResponse.json(
          { 
            error: 'Marketing must be a valid integer',
            code: 'INVALID_MARKETING' 
          },
          { status: 400 }
        );
      }
    }

    if (totalRevenue !== undefined) {
      if (typeof totalRevenue !== 'number' || !Number.isInteger(totalRevenue)) {
        return NextResponse.json(
          { 
            error: 'Total revenue must be a valid integer',
            code: 'INVALID_TOTAL_REVENUE' 
          },
          { status: 400 }
        );
      }
    }

    if (expenses !== undefined) {
      if (typeof expenses !== 'number' || !Number.isInteger(expenses)) {
        return NextResponse.json(
          { 
            error: 'Expenses must be a valid integer',
            code: 'INVALID_EXPENSES' 
          },
          { status: 400 }
        );
      }
    }

    if (profit !== undefined) {
      if (typeof profit !== 'number' || !Number.isInteger(profit)) {
        return NextResponse.json(
          { 
            error: 'Profit must be a valid integer',
            code: 'INVALID_PROFIT' 
          },
          { status: 400 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: any = {
      updatedAt: new Date()
    };

    if (month !== undefined) updates.month = month;
    if (marketing !== undefined) updates.marketing = marketing;
    if (totalRevenue !== undefined) updates.totalRevenue = totalRevenue;
    if (expenses !== undefined) updates.expenses = expenses;
    if (profit !== undefined) updates.profit = profit;

    // Update record
    const updated = await db
      .update(financialMetrics)
      .set(updates)
      .where(and(eq(financialMetrics.id, id), eq(financialMetrics.userId, user.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update record', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, data: updated[0] },
      { status: 200 }
    );

  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error,
        code: 'INTERNAL_ERROR' 
      },
      { status: 500 }
    );
  }
}