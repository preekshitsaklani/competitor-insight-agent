/**
 * Slack Notification Service
 * Sends notifications to Slack via webhooks
 */

interface SlackNotification {
  webhookUrl: string;
  message: string;
  insights?: Array<{
    competitorName: string;
    summary: string;
    priority: string;
    detectedAt: string;
  }>;
}

/**
 * Send notification to Slack
 */
export async function sendSlackNotification(options: SlackNotification) {
  try {
    const blocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "📊 Competitive Intelligence Update",
          emoji: true,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: options.message,
        },
      },
    ];

    if (options.insights && options.insights.length > 0) {
      blocks.push({
        type: "divider",
      } as any);

      options.insights.forEach((insight) => {
        const priorityEmoji =
          insight.priority === "high" ? "🔴" : insight.priority === "medium" ? "🟡" : "🟢";

        blocks.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${priorityEmoji} ${insight.competitorName}* (${insight.priority.toUpperCase()} priority)\n${insight.summary}\n_${new Date(insight.detectedAt).toLocaleDateString()}_`,
          },
        } as any);
      });

      blocks.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `<${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/insights|View All Insights →>`,
        },
      } as any);
    }

    const response = await fetch(options.webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ blocks }),
    });

    if (!response.ok) {
      throw new Error(`Slack API responded with ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to send Slack notification:", error);
    throw error;
  }
}

/**
 * Send insights digest to Slack
 */
export async function sendSlackDigest(
  webhookUrl: string,
  insights: Array<{
    competitorName: string;
    summary: string;
    priority: string;
    detectedAt: string;
  }>,
  frequency: "daily" | "weekly"
) {
  const period = frequency === "daily" ? "Today's" : "This Week's";
  const message = `*${period} Competitive Intelligence Digest*\n${insights.length} new insights detected:`;

  return sendSlackNotification({
    webhookUrl,
    message,
    insights,
  });
}