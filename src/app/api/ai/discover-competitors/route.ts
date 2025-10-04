import { NextRequest, NextResponse } from "next/server";
import { analyzeCompetitorDiscovery } from "@/lib/gemini";
import { db } from "@/db";
import { corporationInfo } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { companyDescription, userId } = await request.json();

    if (!companyDescription) {
      return NextResponse.json(
        { error: "Company description is required" },
        { status: 400 }
      );
    }

    // Fetch corporation info for additional context
    const corpInfo = await db
      .select()
      .from(corporationInfo)
      .where(eq(corporationInfo.userId, userId))
      .limit(1);

    const context = corpInfo.length > 0
      ? {
          companySize: corpInfo[0].companySize,
          industry: corpInfo[0].industry,
          description: corpInfo[0].companyDescription,
        }
      : null;

    // Use Gemini AI to discover competitors
    const competitors = await analyzeCompetitorDiscovery(
      companyDescription,
      context
    );

    return NextResponse.json({ competitors });
  } catch (error) {
    console.error("Error discovering competitors:", error);
    return NextResponse.json(
      { error: "Failed to discover competitors" },
      { status: 500 }
    );
  }
}