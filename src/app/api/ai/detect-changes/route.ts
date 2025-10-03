import { NextRequest, NextResponse } from "next/server";
import { detectChanges } from "@/lib/gemini";

/**
 * POST /api/ai/detect-changes
 * Detect and analyze changes between two content versions
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { oldContent, newContent, competitorName } = body;

    // Validate required fields
    if (!oldContent || !newContent || !competitorName) {
      return NextResponse.json(
        { error: "Missing required fields: oldContent, newContent, competitorName" },
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

    // Detect changes using Gemini
    const analysis = await detectChanges(oldContent, newContent, competitorName);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error detecting changes:", error);
    return NextResponse.json(
      { 
        error: "Failed to detect changes", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}