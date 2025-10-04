import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { competitors, socialAccounts, insights } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/auth';
import { analyzeCompetitorContent } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { competitorId } = await request.json();

    if (!competitorId || isNaN(parseInt(competitorId))) {
      return NextResponse.json({ 
        error: "Valid competitor ID is required",
        code: "INVALID_COMPETITOR_ID" 
      }, { status: 400 });
    }

    // Verify competitor belongs to user
    const competitor = await db.select()
      .from(competitors)
      .where(and(eq(competitors.id, parseInt(competitorId)), eq(competitors.userId, user.id)))
      .limit(1);
    
    if (competitor.length === 0) {
      return NextResponse.json({ 
        error: 'Competitor not found or access denied',
        code: 'COMPETITOR_ACCESS_DENIED'
      }, { status: 403 });
    }

    const competitorData = competitor[0];

    // Fetch social accounts for this competitor
    const socialAccountsList = await db.select()
      .from(socialAccounts)
      .where(and(
        eq(socialAccounts.competitorId, parseInt(competitorId)),
        eq(socialAccounts.isActive, true)
      ));

    const scrapedData: any[] = [];
    
    // Scrape website if URL provided
    if (competitorData.websiteUrl) {
      try {
        const websiteResponse = await fetch(competitorData.websiteUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; AetherBot/1.0)'
          },
          signal: AbortSignal.timeout(10000)
        });
        
        if (websiteResponse.ok) {
          const html = await websiteResponse.text();
          // Extract text content (simple approach)
          const textContent = html
            .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
            .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
            .replace(/<[^>]+>/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .substring(0, 5000); // Limit to first 5000 chars
          
          scrapedData.push({
            platform: 'website',
            url: competitorData.websiteUrl,
            content: textContent
          });
        }
      } catch (error) {
        console.error('Website scraping error:', error);
      }
    }

    // Scrape social media accounts
    for (const account of socialAccountsList) {
      try {
        // For social media, we'll create a mock scrape response
        // In production, you'd use proper APIs or scraping services
        const socialContent = await fetchSocialContent(account.platform, account.url || account.handle);
        
        if (socialContent) {
          scrapedData.push({
            platform: account.platform,
            url: account.url || `https://${account.platform}.com/${account.handle}`,
            content: socialContent
          });
        }
      } catch (error) {
        console.error(`Social scraping error for ${account.platform}:`, error);
      }
    }

    if (scrapedData.length === 0) {
      return NextResponse.json({ 
        error: 'No data could be scraped from competitor sources',
        code: 'NO_DATA_SCRAPED'
      }, { status: 400 });
    }

    // Analyze all scraped content with Gemini AI
    const analysisResults = await analyzeCompetitorContent(
      competitorData.name,
      scrapedData
    );

    // Store insights in database
    const createdInsights = [];
    for (const analysis of analysisResults) {
      const insertData = {
        userId: user.id,
        competitorId: parseInt(competitorId),
        platform: analysis.platform,
        content: analysis.rawContent,
        summary: analysis.summary,
        insightType: analysis.insightType,
        sentiment: analysis.sentiment,
        priority: analysis.priority,
        keyPoints: analysis.keyPoints,
        recommendations: analysis.recommendations,
        impact: analysis.impact,
        tags: analysis.tags,
        labels: analysis.labels,
        publicOpinion: analysis.publicOpinion,
        publicOpinionPositive: analysis.publicOpinionPositive || 0,
        publicOpinionNegative: analysis.publicOpinionNegative || 0,
        sourceUrl: analysis.sourceUrl,
        detectedAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      const newInsight = await db.insert(insights)
        .values(insertData)
        .returning();

      createdInsights.push(newInsight[0]);
    }

    return NextResponse.json({
      message: `Successfully scraped and analyzed ${scrapedData.length} sources`,
      sourcesScraped: scrapedData.length,
      insightsGenerated: createdInsights.length,
      insights: createdInsights
    }, { status: 201 });

  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}

// Helper function to fetch social media content
async function fetchSocialContent(platform: string, handle: string): Promise<string | null> {
  // This is a simplified version. In production, you would:
  // 1. Use official APIs (Twitter API, LinkedIn API, etc.)
  // 2. Use web scraping services like Apify, Bright Data
  // 3. Use headless browsers with Puppeteer/Playwright
  
  try {
    // For now, we'll simulate fetching by making basic HTTP requests
    let url = '';
    
    switch (platform.toLowerCase()) {
      case 'linkedin':
        url = handle.startsWith('http') ? handle : `https://www.linkedin.com/company/${handle}`;
        break;
      case 'twitter':
      case 'x':
        url = handle.startsWith('http') ? handle : `https://twitter.com/${handle}`;
        break;
      case 'facebook':
        url = handle.startsWith('http') ? handle : `https://www.facebook.com/${handle}`;
        break;
      case 'instagram':
        url = handle.startsWith('http') ? handle : `https://www.instagram.com/${handle}`;
        break;
      case 'reddit':
        url = handle.startsWith('http') ? handle : `https://www.reddit.com/user/${handle}`;
        break;
      case 'bluesky':
        url = handle.startsWith('http') ? handle : `https://bsky.app/profile/${handle}`;
        break;
      case 'truth social':
        url = handle.startsWith('http') ? handle : `https://truthsocial.com/@${handle}`;
        break;
      default:
        return null;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; AetherBot/1.0)'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      const html = await response.text();
      // Extract text content
      const textContent = html
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 3000); // Limit content
      
      return textContent;
    }

    return null;
  } catch (error) {
    console.error(`Error fetching ${platform}:`, error);
    return null;
  }
}