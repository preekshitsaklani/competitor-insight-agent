import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSettings } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const settings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 });
    }

    return NextResponse.json(settings[0]);
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
      emailEnabled, 
      emailFrequency, 
      slackEnabled, 
      slackWebhookUrl, 
      preferredDeliveryTime 
    } = requestBody;

    // Validate emailFrequency
    if (emailFrequency && !['daily', 'weekly'].includes(emailFrequency)) {
      return NextResponse.json({ 
        error: "Email frequency must be 'daily' or 'weekly'",
        code: "INVALID_EMAIL_FREQUENCY" 
      }, { status: 400 });
    }

    // Validate preferredDeliveryTime format (HH:MM)
    if (preferredDeliveryTime && !/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/.test(preferredDeliveryTime)) {
      return NextResponse.json({ 
        error: "Preferred delivery time must be in HH:MM format",
        code: "INVALID_TIME_FORMAT" 
      }, { status: 400 });
    }

    // Prepare data with defaults and sanitization
    const settingsData = {
      userId: user.id,
      emailEnabled: emailEnabled !== undefined ? emailEnabled : true,
      emailFrequency: emailFrequency?.trim() || 'daily',
      slackEnabled: slackEnabled !== undefined ? slackEnabled : false,
      slackWebhookUrl: slackWebhookUrl?.trim() || null,
      preferredDeliveryTime: preferredDeliveryTime?.trim() || '09:00',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Check if settings already exist
    const existingSettings = await db.select()
      .from(userSettings)
      .where(eq(userSettings.userId, user.id))
      .limit(1);

    if (existingSettings.length > 0) {
      // Update existing settings
      const updateData = {
        emailEnabled: settingsData.emailEnabled,
        emailFrequency: settingsData.emailFrequency,
        slackEnabled: settingsData.slackEnabled,
        slackWebhookUrl: settingsData.slackWebhookUrl,
        preferredDeliveryTime: settingsData.preferredDeliveryTime,
        updatedAt: new Date().toISOString(),
      };

      const updatedSettings = await db.update(userSettings)
        .set(updateData)
        .where(eq(userSettings.userId, user.id))
        .returning();

      return NextResponse.json(updatedSettings[0]);
    } else {
      // Create new settings
      const newSettings = await db.insert(userSettings)
        .values(settingsData)
        .returning();

      return NextResponse.json(newSettings[0], { status: 201 });
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}