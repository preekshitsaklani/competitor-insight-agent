/**
 * Email Service
 * Handles all email communications including password reset, OTP, 2FA, and notifications
 */

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

/**
 * Send email using configured email service
 * In production, integrate with SendGrid, AWS SES, or similar
 */
export async function sendEmail(options: EmailOptions) {
  // For development, log email instead of sending
  if (process.env.NODE_ENV === "development") {
    console.log("📧 Email would be sent:", {
      to: options.to,
      subject: options.subject,
      preview: options.text || options.html.substring(0, 100),
    });
    return { success: true, messageId: "dev-" + Date.now() };
  }

  // Production email sending
  // Integrate with your email provider here (SendGrid, AWS SES, etc.)
  try {
    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.SENDGRID_API_KEY}`,
      },
      body: JSON.stringify({
        personalizations: [{ to: [{ email: options.to }] }],
        from: {
          email: process.env.EMAIL_FROM || "noreply@competitortracker.com",
          name: "Competitor Tracker",
        },
        subject: options.subject,
        content: [
          { type: "text/html", value: options.html },
          ...(options.text ? [{ type: "text/plain", value: options.text }] : []),
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Email service responded with ${response.status}`);
    }

    return { success: true, messageId: response.headers.get("x-message-id") };
  } catch (error) {
    console.error("Failed to send email:", error);
    throw error;
  }
}

/**
 * Generate OTP code (6 digits)
 */
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Send password reset email
 */
export async function sendPasswordResetEmail(email: string, resetToken: string, resetUrl: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .button { display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>We received a request to reset your password for your Competitor Tracker account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="button">Reset Password</a>
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${resetUrl}</p>
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this password reset, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Competitor Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Reset Your Password",
    html,
    text: `Reset your password by visiting: ${resetUrl}\n\nThis link will expire in 1 hour.`,
  });
}

/**
 * Send phone verification OTP
 */
export async function sendPhoneOTP(email: string, phone: string, otp: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .otp-code { background: #fff; border: 2px dashed #000; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Phone Verification Code</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested to verify your phone number: <strong>${phone}</strong></p>
          <p>Enter this verification code:</p>
          <div class="otp-code">${otp}</div>
          <p><strong>This code will expire in 10 minutes.</strong></p>
          <p>If you didn't request this verification, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Competitor Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "Phone Verification Code",
    html,
    text: `Your phone verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
  });
}

/**
 * Send 2FA code for account deletion
 */
export async function send2FACode(email: string, code: string) {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #dc2626; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .code { background: #fff; border: 2px solid #dc2626; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 8px; margin: 20px 0; border-radius: 8px; color: #dc2626; }
        .warning { background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>⚠️ Account Deletion Verification</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>You requested to delete your Competitor Tracker account.</p>
          <div class="warning">
            <strong>⚠️ Warning:</strong> This action will schedule your account for permanent deletion in 30 days. You can cancel this by logging in before then.
          </div>
          <p>Enter this verification code to confirm:</p>
          <div class="code">${code}</div>
          <p><strong>This code will expire in 15 minutes.</strong></p>
          <p>If you didn't request this deletion, please secure your account immediately.</p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Competitor Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: "⚠️ Account Deletion Verification Code",
    html,
    text: `Your account deletion verification code is: ${code}\n\nThis code will expire in 15 minutes.\n\nWARNING: This will schedule your account for deletion in 30 days.`,
  });
}

/**
 * Send insights digest (daily/weekly)
 */
export async function sendInsightsDigest(
  email: string,
  insights: Array<{
    competitorName: string;
    summary: string;
    priority: string;
    detectedAt: string;
  }>,
  frequency: "daily" | "weekly"
) {
  const period = frequency === "daily" ? "Today's" : "This Week's";
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #000; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
        .insight { background: #fff; border-left: 4px solid #000; padding: 15px; margin: 15px 0; border-radius: 4px; }
        .insight-header { display: flex; justify-content: space-between; margin-bottom: 8px; }
        .competitor { font-weight: bold; color: #000; }
        .priority-high { color: #dc2626; font-size: 12px; font-weight: bold; }
        .priority-medium { color: #f59e0b; font-size: 12px; font-weight: bold; }
        .priority-low { color: #10b981; font-size: 12px; font-weight: bold; }
        .summary { color: #666; font-size: 14px; }
        .button { display: inline-block; background: #000; color: #fff; padding: 12px 30px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 ${period} Competitive Insights</h1>
        </div>
        <div class="content">
          <p>Hello,</p>
          <p>Here are your latest competitive intelligence insights:</p>
          
          ${insights.map((insight) => `
            <div class="insight">
              <div class="insight-header">
                <span class="competitor">${insight.competitorName}</span>
                <span class="priority-${insight.priority.toLowerCase()}">${insight.priority.toUpperCase()} PRIORITY</span>
              </div>
              <p class="summary">${insight.summary}</p>
              <p style="font-size: 12px; color: #999; margin-top: 8px;">
                ${new Date(insight.detectedAt).toLocaleDateString()}
              </p>
            </div>
          `).join("")}
          
          <p style="text-align: center;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/insights" class="button">
              View All Insights
            </a>
          </p>
          
          <p style="font-size: 12px; color: #666; margin-top: 30px;">
            You're receiving this because you have ${frequency} notifications enabled. 
            <a href="${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/settings/profile">Update preferences</a>
          </p>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Competitor Tracker. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: email,
    subject: `${period} Competitive Intelligence Digest - ${insights.length} New Insights`,
    html,
    text: `${period} Competitive Insights:\n\n${insights.map((i) => `${i.competitorName} (${i.priority}): ${i.summary}`).join("\n\n")}`,
  });
}