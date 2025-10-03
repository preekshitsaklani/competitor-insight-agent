/**
 * Google Gemini AI Integration
 * Provides utility functions for AI-powered competitive intelligence analysis
 */

import { GoogleGenAI } from "@google/genai";

// Initialize Gemini client
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
});

/**
 * Generate competitive insights from content
 */
export async function generateInsight(content: {
  competitorName: string;
  platform: string;
  content: string;
  url?: string;
}) {
  const prompt = `You are a competitive intelligence analyst. Analyze the following competitor content and provide actionable insights.

Competitor: ${content.competitorName}
Platform: ${content.platform}
Content: ${content.content}
${content.url ? `URL: ${content.url}` : ""}

Provide a comprehensive analysis in the following JSON format:
{
  "summary": "Brief 2-3 sentence summary of the key information",
  "type": "Product Launch" | "Feature Update" | "Marketing Campaign" | "Pricing Change" | "Partnership" | "Other",
  "sentiment": "Threat" | "Opportunity" | "Neutral",
  "priority": "High" | "Medium" | "Low",
  "keyPoints": ["point1", "point2", "point3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "impact": "Detailed analysis of potential impact on your business",
  "tags": ["tag1", "tag2", "tag3"]
}

Be specific, actionable, and focus on business implications.`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });
  
  const response = result.text;
  
  // Parse JSON response
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse AI response");
}

/**
 * Detect and analyze changes between two content versions
 */
export async function detectChanges(oldContent: string, newContent: string, competitorName: string) {
  const prompt = `You are a competitive intelligence analyst specializing in change detection. Compare these two versions of content from ${competitorName} and identify significant changes.

OLD VERSION:
${oldContent}

NEW VERSION:
${newContent}

Provide analysis in JSON format:
{
  "hasSignificantChanges": boolean,
  "changeType": "Major" | "Minor" | "Critical",
  "changes": [
    {
      "category": "Pricing" | "Features" | "Messaging" | "Design" | "Content" | "Other",
      "description": "What changed",
      "significance": "Why this matters",
      "businessImplication": "Impact on competitive positioning"
    }
  ],
  "summary": "Overall summary of changes",
  "recommendation": "Suggested action items"
}`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });
  
  const response = result.text;
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse AI response");
}

/**
 * Generate weekly digest summary
 */
export async function generateDigest(insights: Array<{
  competitorName: string;
  type: string;
  summary: string;
  priority: string;
  createdAt: string;
}>) {
  const prompt = `You are a competitive intelligence analyst creating a weekly digest. Summarize these insights into an executive briefing.

Insights:
${insights.map((insight, i) => `
${i + 1}. ${insight.competitorName} - ${insight.type} (${insight.priority} priority)
   ${insight.summary}
   Date: ${insight.createdAt}
`).join("\n")}

Create a digest in JSON format:
{
  "executiveSummary": "2-3 paragraph overview of the week's competitive landscape",
  "topThreats": ["threat1", "threat2", "threat3"],
  "topOpportunities": ["opportunity1", "opportunity2", "opportunity3"],
  "trendingThemes": ["theme1", "theme2", "theme3"],
  "recommendations": [
    {
      "action": "What to do",
      "reason": "Why it matters",
      "urgency": "High" | "Medium" | "Low"
    }
  ],
  "competitorActivity": {
    "mostActive": "Competitor name and why",
    "watchList": ["Competitors to watch closely"]
  }
}`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });
  
  const response = result.text;
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse AI response");
}

/**
 * Analyze sentiment of competitor content
 */
export async function analyzeSentiment(content: string, context: string) {
  const prompt = `Analyze the sentiment and tone of this competitor content in the context of: ${context}

Content: ${content}

Provide analysis in JSON format:
{
  "sentiment": "Positive" | "Negative" | "Neutral" | "Mixed",
  "tone": "Professional" | "Aggressive" | "Friendly" | "Urgent" | "Casual",
  "confidence": 0.0 to 1.0,
  "competitiveStance": "Attacking" | "Defensive" | "Collaborative" | "Neutral",
  "keyEmotions": ["emotion1", "emotion2"],
  "businessIntent": "What they're trying to achieve"
}`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });
  
  const response = result.text;
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse AI response");
}

/**
 * Extract key features from product launch announcement
 */
export async function extractFeatures(content: string, competitorName: string) {
  const prompt = `Extract and analyze features from this ${competitorName} product announcement:

${content}

Provide analysis in JSON format:
{
  "features": [
    {
      "name": "Feature name",
      "description": "What it does",
      "category": "Core" | "Premium" | "Enterprise" | "Beta",
      "competitiveAdvantage": "How this compares to market standards",
      "ourGap": "Do we have this? How does ours compare?"
    }
  ],
  "targetAudience": "Who is this for",
  "pricingStrategy": "Observed pricing approach if mentioned",
  "marketPositioning": "How they're positioning this"
}`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });
  
  const response = result.text;
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse AI response");
}

/**
 * Generate competitive battle card
 */
export async function generateBattleCard(competitorData: {
  name: string;
  recentInsights: Array<{ type: string; summary: string }>;
  strengths: string[];
  weaknesses: string[];
}) {
  const prompt = `Create a competitive battle card for ${competitorData.name} based on recent intelligence.

Recent Activity:
${competitorData.recentInsights.map(i => `- ${i.type}: ${i.summary}`).join("\n")}

Known Strengths: ${competitorData.strengths.join(", ")}
Known Weaknesses: ${competitorData.weaknesses.join(", ")}

Generate battle card in JSON format:
{
  "overview": "2-3 sentences about the competitor",
  "strengths": ["Updated list of key strengths"],
  "weaknesses": ["Updated list of key weaknesses"],
  "differentiators": ["What makes them unique"],
  "vulnerabilities": ["Where they're exposed"],
  "winningStrategies": ["How to compete effectively"],
  "lossReasons": ["Why customers might choose them"],
  "keyMessaging": ["Talking points when competing against them"],
  "pricingIntel": "Pricing insights if available"
}`;

  const result = await genAI.models.generateContent({
    model: "gemini-2.0-flash-exp",
    contents: prompt,
  });
  
  const response = result.text;
  
  const jsonMatch = response.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[0]);
  }
  
  throw new Error("Failed to parse AI response");
}