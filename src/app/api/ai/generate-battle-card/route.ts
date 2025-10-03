import { NextRequest, NextResponse } from "next/server";
import { generateBattleCard } from "@/lib/gemini";

/**
 * POST /api/ai/generate-battle-card
 * Generate competitive battle card from intelligence data
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, recentInsights, strengths, weaknesses } = body;

    // Validate required fields
    if (!name || !recentInsights || !Array.isArray(recentInsights)) {
      return NextResponse.json(
        { error: "Missing required fields: name, recentInsights (array)" },
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

    // Generate battle card using Gemini
    const battleCard = await generateBattleCard({
      name,
      recentInsights,
      strengths: strengths || [],
      weaknesses: weaknesses || [],
    });

    return NextResponse.json({
      success: true,
      battleCard,
    });
  } catch (error) {
    console.error("Error generating battle card:", error);
    return NextResponse.json(
      { 
        error: "Failed to generate battle card", 
        details: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}