import { NextRequest, NextResponse } from "next/server";
import { analyzeSentiment } from "@/lib/gemini";

/**
 * POST /api/ai/analyze-sentiment
 * Analyze sentiment and tone of competitor content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, context } = body;

    // Validate required fields
    if (!content || !context) {
      return NextResponse.json(
        { error: "Missing required fields: content, context" },
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

    // Analyze sentiment using Gemini
    const analysis = await analyzeSentiment(content, context);

    return NextResponse.json({
      success: true,
      analysis,
    });
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return NextResponse.json(
      { 
        error: "Failed to analyze sentiment", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}