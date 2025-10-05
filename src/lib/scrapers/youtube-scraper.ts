import { GoogleGenerativeAI } from '@google/generative-ai';

interface YouTubeVideo {
  id: string;
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  viewCount?: string;
  likeCount?: string;
}

interface YouTubeComment {
  text: string;
  author: string;
  timestamp: string;
  likeCount?: number;
}

export async function scrapeYouTube(channelName: string, maxVideos: number = 50): Promise<YouTubeVideo[]> {
  try {
    // Use YouTube's RSS feed for public data (no API key required)
    const searchQuery = encodeURIComponent(channelName);
    const searchUrl = `https://www.youtube.com/results?search_query=${searchQuery}&sp=CAI%253D`;
    
    // For demo purposes, return mock data structure
    // In production, you'd use YouTube Data API v3 with API key
    console.log(`[YouTube] Searching for: ${channelName}`);
    
    return [];
  } catch (error) {
    console.error('YouTube scraping error:', error);
    return [];
  }
}

export async function scrapeYouTubeComments(videoId: string, maxComments: number = 50): Promise<YouTubeComment[]> {
  try {
    // In production, use YouTube Data API v3 commentThreads endpoint
    console.log(`[YouTube] Would scrape ${maxComments} comments from video: ${videoId}`);
    
    return [];
  } catch (error) {
    console.error('YouTube comments scraping error:', error);
    return [];
  }
}

export async function analyzeYouTubeWithGemini(
  videos: YouTubeVideo[],
  comments: YouTubeComment[],
  competitorName: string
) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY not configured');
      return null;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    const videoTitles = videos.slice(0, 10).map(v => v.title).join('\n- ');
    const commentTexts = comments.slice(0, 100).map(c => c.text).join('\n- ');

    const prompt = `Analyze this YouTube activity for competitor "${competitorName}".

Recent Videos:
- ${videoTitles}

Recent Comments (${comments.length} total):
- ${commentTexts}

Provide a JSON response with:
{
  "summary": "2-3 sentence summary of their YouTube presence and strategy",
  "sentiment": "positive/neutral/negative",
  "priority": "high/medium/low",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "labels": ["label1", "label2"],
  "publicOpinionPositive": <0-100 integer>,
  "publicOpinionNegative": <0-100 integer>,
  "sourceUrl": "URL to most relevant video"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('YouTube Gemini analysis error:', error);
    return null;
  }
}