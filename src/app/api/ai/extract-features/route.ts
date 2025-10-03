import { NextRequest, NextResponse } from "next/server";
import { extractFeatures } from "@/lib/gemini";

/**
 * POST /api/ai/extract-features
 * Extract and analyze features from product announcements
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, competitorName } = body;

    // Validate required fields
    if (!content || !competitorName) {
      return NextResponse.json(
        { error: "Missing required fields: content, competitorName" },
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

    // Extract features using Gemini
    const analysis = await extractFeatures(content, competitorName);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error extracting features:", error);
    return NextResponse.json(
      { 
        error: "Failed to extract features", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}