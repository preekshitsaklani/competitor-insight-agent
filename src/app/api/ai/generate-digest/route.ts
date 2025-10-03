import { NextRequest, NextResponse } from "next/server";
import { generateDigest } from "@/lib/gemini";

/**
 * POST /api/ai/generate-digest
 * Generate weekly digest summary from insights
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { insights } = body;

    // Validate required fields
    if (!insights || !Array.isArray(insights) || insights.length === 0) {
      return NextResponse.json(
        { error: "Missing or invalid insights array" },
        { status: 400 }
      );
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Gemini API key not configured. Please add GEMINI_API_KEY to environment variables." },
        { status: 500 }
      );
    }

    // Generate digest using Gemini
    const digest = await generateDigest(insights);

    return NextResponse.json({
      success: true,
      digest,
    });
  } catch (error) {
    console.error("Error generating digest:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate digest", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}