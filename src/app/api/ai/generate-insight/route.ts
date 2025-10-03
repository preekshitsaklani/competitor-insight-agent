import { NextRequest, NextResponse } from "next/server";
import { generateInsight } from "@/lib/gemini";

/**
 * POST /api/ai/generate-insight
 * Generate AI-powered competitive insights from content
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { competitorName, platform, content, url } = body;

    // Validate required fields
    if (!competitorName || !platform || !content) {
      return NextResponse.json(
        { error: "Missing required fields: competitorName, platform, content" },
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

    // Generate insight using Gemini
    const insight = await generateInsight({
      competitorName,
      platform,
      content,
      url,
    });

    return NextResponse.json({
      success: true,
      insight,
    });
  } catch (error) {
    console.error("Error generating insight:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate insight", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}