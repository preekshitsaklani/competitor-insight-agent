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

export async function analyzeCompetitorContent(
  content: string,
  competitorName: string,
  source: string
) {
  const prompt = `
You are an expert competitive intelligence analyst. Analyze the following content from ${competitorName}'s ${source} and provide comprehensive insights.

Content:
${content}

Your task:
1. Identify if there are any new product launches, feature updates, service launches, software releases, or significant announcements
2. Analyze the sentiment (is this a threat, opportunity, or neutral for competitors?)
3. Determine priority level (high, medium, low) based on potential business impact
4. Extract key points that matter most
5. Provide actionable recommendations
6. Assess public opinion by analyzing tone and reception indicators in the content
7. Assign multiple labels for what was detected (e.g., "Product Launch", "Feature Update", "Service Launch", "Software Launch", "Marketing Campaign", "Partnership", "Executive Hire", "Pricing Change")

Respond in JSON format:
{
  "hasSignificantUpdate": boolean,
  "summary": "Professional, concise 2-3 sentence summary",
  "insightType": "product_launch" | "feature_update" | "pricing_change" | "marketing_campaign" | "executive_hire" | "partnership" | "other",
  "sentiment": "threat" | "opportunity" | "neutral",
  "priority": "high" | "medium" | "low",
  "keyPoints": ["point1", "point2", "point3"],
  "recommendations": ["recommendation1", "recommendation2"],
  "impact": "Brief description of business impact",
  "tags": ["tag1", "tag2"],
  "labels": ["Product Launch", "Feature Update", etc.],
  "publicOpinion": {
    "overall": "positive" | "negative" | "mixed" | "neutral",
    "likes": "What people like about it",
    "dislikes": "What people dislike about it"
  },
  "publicOpinionPositive": number (0-100),
  "publicOpinionNegative": number (0-100)
}

Only respond with valid JSON, no markdown formatting.
`;

  const result = await genAI.models.generateContent({
    model: 'gemini-2.0-flash-exp',
    contents: prompt
  });

  const responseText = result.text;
  // Remove markdown code blocks if present
  const cleanedText = responseText
    .replace(/```json\n?/g, '')
    .replace(/```\n?/g, '')
    .trim();
  
  const analysis = JSON.parse(cleanedText);

  // Only create insights for significant updates
  if (analysis.hasSignificantUpdate) {
    return {
      platform: source,
      sourceUrl: source,
      rawContent: content.substring(0, 1000), // Store first 1000 chars
      summary: analysis.summary,
      insightType: analysis.insightType,
      sentiment: analysis.sentiment,
      priority: analysis.priority,
      keyPoints: analysis.keyPoints,
      recommendations: analysis.recommendations,
      impact: analysis.impact,
      tags: analysis.tags,
      labels: analysis.labels || [],
      publicOpinion: analysis.publicOpinion,
      publicOpinionPositive: analysis.publicOpinionPositive || 0,
      publicOpinionNegative: analysis.publicOpinionNegative || 0
    };
  }
}

export async function analyzeCompetitorDiscovery(
  companyDescription: string,
  context: {
    companySize?: number;
    industry?: string;
    description?: string;
  } | null
) {
  const prompt = `You are a competitive intelligence analyst. Based on the following company description, identify 5-10 direct competitors.

Company Description: ${companyDescription}

${context ? `Additional Context:
- Company Size: ${context.companySize} employees
- Industry: ${context.industry}
- Description: ${context.description}` : ""}

For each competitor, provide:
1. Company name
2. Website URL (official domain only)
3. Industry/category
4. Brief description (1-2 sentences)
5. Official social media handles (ONLY if you're certain they exist):
   - LinkedIn (company page URL)
   - Twitter/X (handle)
   - Facebook (page URL)
   - Instagram (handle)
   - Reddit (subreddit if applicable)

IMPORTANT: Only include social media handles if you are absolutely certain they are official and active. If unsure, omit them.

Return your response in the following JSON format:
{
  "competitors": [
    {
      "name": "Company Name",
      "websiteUrl": "https://example.com",
      "industry": "Industry",
      "description": "Brief description",
      "socialAccounts": [
        {
          "platform": "linkedin",
          "url": "https://linkedin.com/company/...",
          "handle": "company-name"
        }
      ]
    }
  ]
}`;

  const result = await genAI.models.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Failed to parse AI response");
  }

  const data = JSON.parse(jsonMatch[0]);
  return data.competitors;
}