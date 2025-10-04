import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { insights, competitors, userSettings, user } from "@/db/schema";
import { eq, gte, and } from "drizzle-orm";
import { sendInsightsDigest } from "@/lib/email";
import { sendSlackDigest } from "@/lib/slack";

export async function POST(request: NextRequest) {
  try {
    // This endpoint should be called by a cron job or scheduler
    // Verify it's being called from a trusted source
    const authHeader = request.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "dev-secret";

    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { frequency = "daily" } = await request.json();

    // Calculate time window
    const now = new Date();
    const hoursAgo = frequency === "daily" ? 24 : 168; // 24 hours or 7 days
    const cutoffTime = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);

    // Get all users with notification settings
    const usersWithSettings = await db
      .select({
        userId: userSettings.userId,
        email: user.email,
        name: user.name,
        emailNotifications: userSettings.emailNotifications,
        slackNotifications: userSettings.slackNotifications,
        slackWebhookUrl: userSettings.slackWebhookUrl,
        notificationFrequency: userSettings.notificationFrequency,
        notificationTime: userSettings.notificationTime,
      })
      .from(userSettings)
      .innerJoin(user, eq(userSettings.userId, user.id))
      .where(
        and(
          eq(userSettings.notificationFrequency, frequency),
          // Could add time-of-day check here
        )
      );

    const results = {
      sent: 0,
      failed: 0,
      skipped: 0,
    };

    for (const userSetting of usersWithSettings) {
      try {
        // Get user's insights for the time period
        const userCompetitors = await db
          .select()
          .from(competitors)
          .where(eq(competitors.userId, userSetting.userId));

        if (userCompetitors.length === 0) {
          results.skipped++;
          continue;
        }

        const competitorIds = userCompetitors.map((c) => c.id);

        const recentInsights = await db
          .select({
            id: insights.id,
            competitorId: insights.competitorId,
            summary: insights.summary,
            priority: insights.priority,
            detectedAt: insights.detectedAt,
          })
          .from(insights)
          .where(
            and(
              gte(insights.detectedAt, cutoffTime.toISOString()),
              // Filter by competitor IDs - need to iterate
            )
          );

        // Filter insights by competitor IDs
        const userInsights = recentInsights.filter((insight) =>
          competitorIds.includes(insight.competitorId)
        );

        if (userInsights.length === 0) {
          results.skipped++;
          continue;
        }

        // Enrich insights with competitor names
        const enrichedInsights = userInsights.map((insight) => {
          const competitor = userCompetitors.find(
            (c) => c.id === insight.competitorId
          );
          return {
            competitorName: competitor?.name || "Unknown",
            summary: insight.summary || "",
            priority: insight.priority || "medium",
            detectedAt: insight.detectedAt || new Date().toISOString(),
          };
        });

        // Send email notification
        if (
          userSetting.emailNotifications &&
          userSetting.email
        ) {
          await sendInsightsDigest(
            userSetting.email,
            enrichedInsights,
            frequency as "daily" | "weekly"
          );
        }

        // Send Slack notification
        if (
          userSetting.slackNotifications &&
          userSetting.slackWebhookUrl
        ) {
          await sendSlackDigest(
            userSetting.slackWebhookUrl,
            enrichedInsights,
            frequency as "daily" | "weekly"
          );
        }

        results.sent++;
      } catch (error) {
        console.error(
          `Failed to send digest to user ${userSetting.userId}:`,
          error
        );
        results.failed++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `Digest sent successfully`,
      results,
    });
  } catch (error) {
    console.error("Error sending digest:", error);
    return NextResponse.json(
      { error: "Failed to send digest" },
      { status: 500 }
    );
  }
}