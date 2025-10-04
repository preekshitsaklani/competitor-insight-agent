import { NextRequest, NextResponse } from "next/server";
import { generateOTP, send2FACode } from "@/lib/email";

// Store 2FA codes temporarily (in production, use Redis or database)
const codeStore = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Generate 2FA code
    const code = generateOTP();
    const expiresAt = Date.now() + 15 * 60 * 1000; // 15 minutes

    // Store code
    codeStore.set(email, { code, expiresAt });

    // Send 2FA code via email
    await send2FACode(email, code);

    return NextResponse.json({
      success: true,
      message: "2FA code sent successfully",
    });
  } catch (error) {
    console.error("Error sending 2FA code:", error);
    return NextResponse.json(
      { error: "Failed to send 2FA code" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Verify 2FA code
    const stored = codeStore.get(email);
    if (!stored) {
      return NextResponse.json(
        { error: "2FA code not found or expired" },
        { status: 400 }
      );
    }

    if (stored.expiresAt < Date.now()) {
      codeStore.delete(email);
      return NextResponse.json({ error: "2FA code expired" }, { status: 400 });
    }

    if (stored.code !== code) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
    }

    // Code verified, remove from store
    codeStore.delete(email);

    return NextResponse.json({
      success: true,
      message: "2FA verified successfully",
    });
  } catch (error) {
    console.error("Error verifying 2FA:", error);
    return NextResponse.json(
      { error: "Failed to verify 2FA" },
      { status: 500 }
    );
  }
}