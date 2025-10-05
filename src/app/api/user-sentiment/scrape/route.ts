import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { userSentimentData } from '@/db/schema';
import { getCurrentUser } from '@/lib/auth';
import { scrapeYouTube, scrapeYouTubeComments } from '@/lib/scrapers/youtube-scraper';
import { scrapeReddit } from '@/lib/scrapers/reddit-scraper';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface SocialMediaHandles {
  youtube?: string;
  reddit?: string;
  twitter?: string;
}

interface RequestBody {
  socialMediaHandles: SocialMediaHandles;
}

interface RawComment {
  platform: string;
  text: string;
  author: string;
  timestamp: string;
  url?: string;
}

interface SentimentAnalysis {
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
  };
  positiveSummary: string[];
  neutralSummary: string[];
  negativeSummary: string[];
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body: RequestBody = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json({ 
        error: "User ID cannot be provided in request body",
        code: "USER_ID_NOT_ALLOWED" 
      }, { status: 400 });
    }

    const { socialMediaHandles } = body;

    if (!socialMediaHandles || typeof socialMediaHandles !== 'object') {
      return NextResponse.json({ 
        error: "Social media handles object is required",
        code: "MISSING_HANDLES" 
      }, { status: 400 });
    }

    const { youtube, reddit, twitter } = socialMediaHandles;

    if (!youtube && !reddit && !twitter) {
      return NextResponse.json({ 
        error: "At least one social media handle must be provided",
        code: "NO_HANDLES_PROVIDED" 
      }, { status: 400 });
    }

    if (youtube && typeof youtube !== 'string') {
      return NextResponse.json({ 
        error: "YouTube handle must be a string",
        code: "INVALID_YOUTUBE_HANDLE" 
      }, { status: 400 });
    }

    if (reddit && typeof reddit !== 'string') {
      return NextResponse.json({ 
        error: "Reddit handle must be a string",
        code: "INVALID_REDDIT_HANDLE" 
      }, { status: 400 });
    }

    if (twitter && typeof twitter !== 'string') {
      return NextResponse.json({ 
        error: "Twitter handle must be a string",
        code: "INVALID_TWITTER_HANDLE" 
      }, { status: 400 });
    }

    const allComments: RawComment[] = [];

    if (youtube) {
      try {
        const youtubeVideos = await scrapeYouTube(youtube, 10);
        
        for (const video of youtubeVideos.slice(0, 10)) {
          try {
            const comments = await scrapeYouTubeComments(video.id, 50);
            const formattedComments: RawComment[] = comments.map(comment => ({
              platform: 'youtube',
              text: comment.text || '',
              author: comment.author || 'Unknown',
              timestamp: comment.timestamp || new Date().toISOString(),
              url: video.url || `https://youtube.com/watch?v=${video.id}`
            }));
            allComments.push(...formattedComments);
            
            if (allComments.filter(c => c.platform === 'youtube').length >= 500) {
              break;
            }
          } catch (commentError) {
            console.error(`Error scraping comments for video ${video.id}:`, commentError);
          }
        }
      } catch (youtubeError) {
        console.error('YouTube scraping error:', youtubeError);
      }
    }

    if (reddit) {
      try {
        const redditPosts = await scrapeReddit(reddit);
        const formattedRedditComments: RawComment[] = redditPosts.slice(0, 100).map(post => ({
          platform: 'reddit',
          text: post.text || post.title || '',
          author: post.author || 'Unknown',
          timestamp: post.timestamp || new Date().toISOString(),
          url: post.url || ''
        }));
        allComments.push(...formattedRedditComments);
      } catch (redditError) {
        console.error('Reddit scraping error:', redditError);
      }
    }

    if (twitter) {
      console.log('Twitter scraping will be implemented in future');
    }

    if (allComments.length === 0) {
      return NextResponse.json({ 
        error: "No comments could be scraped from provided social media handles",
        code: "NO_COMMENTS_FOUND" 
      }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ 
        error: "GEMINI_API_KEY is not configured",
        code: "GEMINI_API_KEY_NOT_CONFIGURED" 
      }, { status: 500 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const commentsText = allComments.map((c, i) => `${i + 1}. [${c.platform}] ${c.text}`).join('\n');

    const prompt = `Analyze the sentiment of the following social media comments and provide a detailed breakdown.

Comments:
${commentsText}

Return ONLY a valid JSON object (no markdown, no code blocks) with this exact structure:
{
  "sentimentBreakdown": {
    "positive": <percentage as integer>,
    "neutral": <percentage as integer>,
    "negative": <percentage as integer>
  },
  "positiveSummary": ["key point 1", "key point 2", "key point 3"],
  "neutralSummary": ["key point 1", "key point 2", "key point 3"],
  "negativeSummary": ["key point 1", "key point 2", "key point 3"]
}

Requirements:
- positive + neutral + negative must equal exactly 100
- Each summary should contain 3-5 key points
- Summaries should be concise and actionable
- Focus on themes, patterns, and actionable insights`;

    let sentimentAnalysis: SentimentAnalysis;

    try {
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonString = jsonMatch ? jsonMatch[0] : responseText;
      
      sentimentAnalysis = JSON.parse(jsonString);

      const total = sentimentAnalysis.sentimentBreakdown.positive + 
                   sentimentAnalysis.sentimentBreakdown.neutral + 
                   sentimentAnalysis.sentimentBreakdown.negative;

      if (total !== 100) {
        const diff = 100 - total;
        sentimentAnalysis.sentimentBreakdown.neutral += diff;
      }

      if (!Array.isArray(sentimentAnalysis.positiveSummary)) {
        sentimentAnalysis.positiveSummary = [];
      }
      if (!Array.isArray(sentimentAnalysis.neutralSummary)) {
        sentimentAnalysis.neutralSummary = [];
      }
      if (!Array.isArray(sentimentAnalysis.negativeSummary)) {
        sentimentAnalysis.negativeSummary = [];
      }

    } catch (geminiError) {
      console.error('Gemini AI analysis error:', geminiError);
      return NextResponse.json({ 
        error: "Failed to analyze sentiment with Gemini AI",
        code: "GEMINI_ANALYSIS_FAILED",
        details: String(geminiError)
      }, { status: 500 });
    }

    const scrapedAt = new Date();
    const createdAt = new Date();

    const insertData = {
      userId: user.id,
      scrapedAt,
      positivePercentage: Math.round(sentimentAnalysis.sentimentBreakdown.positive),
      neutralPercentage: Math.round(sentimentAnalysis.sentimentBreakdown.neutral),
      negativePercentage: Math.round(sentimentAnalysis.sentimentBreakdown.negative),
      positiveSummary: JSON.stringify(sentimentAnalysis.positiveSummary),
      neutralSummary: JSON.stringify(sentimentAnalysis.neutralSummary),
      negativeSummary: JSON.stringify(sentimentAnalysis.negativeSummary),
      rawComments: JSON.stringify(allComments),
      createdAt
    };

    const [newSentimentData] = await db.insert(userSentimentData)
      .values(insertData)
      .returning();

    return NextResponse.json({
      success: true,
      message: `Successfully analyzed sentiment from ${allComments.length} comments across ${[youtube && 'YouTube', reddit && 'Reddit', twitter && 'Twitter'].filter(Boolean).join(', ')}`,
      sentimentId: newSentimentData.id,
      data: {
        positive: Math.round(sentimentAnalysis.sentimentBreakdown.positive),
        neutral: Math.round(sentimentAnalysis.sentimentBreakdown.neutral),
        negative: Math.round(sentimentAnalysis.sentimentBreakdown.negative)
      }
    }, { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + error 
    }, { status: 500 });
  }
}