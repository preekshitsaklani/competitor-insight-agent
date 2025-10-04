import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get current user profile by ID from session
    const userProfile = await db.select({
      id: user.id,
      name: user.name,
      email: user.email,
      emailVerified: user.emailVerified,
      image: user.image,
      phone: user.phone,
      companyWebsite: user.companyWebsite,
      profilePhotoUrl: user.profilePhotoUrl,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    })
    .from(user)
    .where(eq(user.id, currentUser.id))
    .limit(1);

    if (userProfile.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json(userProfile[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser(request);
    if (!currentUser) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const requestBody = await request.json();
    
    // Security check: reject if userId or any user identifier provided in body
    if ('userId' in requestBody || 'user_id' in requestBody || 'id' in requestBody) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    // Security check: reject if attempting to update system-managed fields
    const systemManagedFields = [
      'createdAt', 'updatedAt', 'emailVerified', 'deactivatedAt', 
      'deactivationRequestedAt', 'deletionRequestedAt', 'deletionScheduledAt'
    ];
    
    for (const field of systemManagedFields) {
      if (field in requestBody) {
        return NextResponse.json({ 
          error: `Field '${field}' cannot be updated by user`,
          code: "SYSTEM_FIELD_NOT_ALLOWED" 
        }, { status: 400 });
      }
    }

    // Extract and validate updatable fields
    const { name, email, phone, companyWebsite, profilePhotoUrl } = requestBody;

    // Validate required fields
    if (name !== undefined && (!name || typeof name !== 'string' || name.trim().length === 0)) {
      return NextResponse.json({ 
        error: "Name is required and must be a non-empty string",
        code: "INVALID_NAME" 
      }, { status: 400 });
    }

    // Validate email format if provided
    if (email !== undefined) {
      if (!email || typeof email !== 'string' || !emailRegex.test(email.trim().toLowerCase())) {
        return NextResponse.json({ 
          error: "Valid email format is required",
          code: "INVALID_EMAIL_FORMAT" 
        }, { status: 400 });
      }

      // Check email uniqueness (exclude current user)
      const existingUser = await db.select({ id: user.id })
        .from(user)
        .where(eq(user.email, email.trim().toLowerCase()))
        .limit(1);

      if (existingUser.length > 0 && existingUser[0].id !== currentUser.id) {
        return NextResponse.json({ 
          error: "Email address is already in use",
          code: "EMAIL_ALREADY_EXISTS" 
        }, { status: 400 });
      }
    }

    // Sanitize and prepare update data
    const updateData: any = {};
    
    if (name !== undefined) {
      updateData.name = name.trim();
    }
    
    if (email !== undefined) {
      updateData.email = email.trim().toLowerCase();
    }
    
    if (phone !== undefined) {
      updateData.phone = phone ? phone.trim() : null;
    }
    
    if (companyWebsite !== undefined) {
      updateData.companyWebsite = companyWebsite ? companyWebsite.trim() : null;
    }
    
    if (profilePhotoUrl !== undefined) {
      updateData.profilePhotoUrl = profilePhotoUrl ? profilePhotoUrl.trim() : null;
    }

    // Always update the updatedAt timestamp
    updateData.updatedAt = new Date();

    // Check if there's anything to update
    if (Object.keys(updateData).length === 1) { // Only updatedAt
      return NextResponse.json({ 
        error: "No valid fields provided for update",
        code: "NO_UPDATE_FIELDS" 
      }, { status: 400 });
    }

    // Update user profile
    const updatedUser = await db.update(user)
      .set(updateData)
      .where(eq(user.id, currentUser.id))
      .returning({
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        image: user.image,
        phone: user.phone,
        companyWebsite: user.companyWebsite,
        profilePhotoUrl: user.profilePhotoUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      });

    if (updatedUser.length === 0) {
      return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
    }

    return NextResponse.json(updatedUser[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}