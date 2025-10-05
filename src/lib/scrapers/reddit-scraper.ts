import { GoogleGenerativeAI } from '@google/generative-ai';

interface RedditPost {
  title: string;
  text: string;
  author: string;
  url: string;
  timestamp: string;
  score?: number;
  numComments?: number;
}

interface RedditComment {
  text: string;
  author: string;
  timestamp: string;
  score?: number;
}

export async function scrapeReddit(query: string, subredditUrl?: string): Promise<{ posts: RedditPost[], comments: RedditComment[] }> {
  try {
    // Use Reddit's JSON API (no auth required for public data)
    // Format: https://www.reddit.com/search.json?q=query&limit=50
    console.log(`[Reddit] Searching for: ${query}`);
    
    // For demo purposes, return empty arrays
    // In production, fetch from Reddit's public JSON API
    return {
      posts: [],
      comments: []
    };
  } catch (error) {
    console.error('Reddit scraping error:', error);
    return {
      posts: [],
      comments: []
    };
  }
}

export async function analyzeRedditWithGemini(
  posts: RedditPost[],
  comments: RedditComment[],
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

    const postTitles = posts.slice(0, 10).map(p => `${p.title} (${p.score || 0} upvotes)`).join('\n- ');
    const commentTexts = comments.slice(0, 50).map(c => c.text).join('\n- ');

    const prompt = `Analyze this Reddit activity for competitor "${competitorName}".

Recent Posts:
- ${postTitles}

Recent Comments (${comments.length} total):
- ${commentTexts}

Provide a JSON response with:
{
  "summary": "2-3 sentence summary of their Reddit presence and community sentiment",
  "sentiment": "positive/neutral/negative",
  "priority": "high/medium/low",
  "keyPoints": ["point 1", "point 2", "point 3"],
  "recommendations": ["recommendation 1", "recommendation 2"],
  "labels": ["label1", "label2"],
  "publicOpinionPositive": <0-100 integer>,
  "publicOpinionNegative": <0-100 integer>,
  "sourceUrl": "URL to most relevant post"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : responseText;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Reddit Gemini analysis error:', error);
    return null;
  }
}