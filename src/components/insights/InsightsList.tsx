"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, TrendingUp, TrendingDown, AlertCircle, Sparkles } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const insights = [
  {
    id: 1,
    competitor: "TechCorp",
    avatar: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=400&h=400&fit=crop",
    platform: "LinkedIn",
    type: "Product Launch",
    priority: "high",
    title: "Major AI Feature Announcement",
    summary: "TechCorp has announced a groundbreaking AI-powered analytics dashboard. This represents a significant competitive threat as it directly addresses our core market segment.",
    keyPoints: [
      "Real-time predictive analytics with 95% accuracy",
      "Integration with 50+ third-party tools",
      "Enterprise pricing starting at $499/month",
      "Beta program launching next week"
    ],
    sentiment: "threat",
    aiInsight: "This launch could potentially capture 15-20% of our target market. Consider accelerating our AI roadmap to maintain competitive advantage.",
    timestamp: "2 hours ago",
    source: "https://linkedin.com/posts/techcorp-ai-launch",
  },
  {
    id: 2,
    competitor: "StartupX",
    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
    platform: "Twitter",
    type: "Pricing Change",
    priority: "high",
    title: "Aggressive Pricing Strategy - 40% Discount on Annual Plans",
    summary: "StartupX launched a limited-time summer sale with significant discounts. This could impact our Q3 conversions.",
    keyPoints: [
      "40% discount on all annual plans (ending Aug 31)",
      "Additional 10% for enterprise customers",
      "Free migration support from competitors",
      "Social media buzz indicates high interest"
    ],
    sentiment: "threat",
    aiInsight: "Strong price-based competition. Monitor churn rates closely and consider matching offer for at-risk customers.",
    timestamp: "5 hours ago",
    source: "https://twitter.com/startupx/status/...",
  },
  {
    id: 3,
    competitor: "InnovateNow",
    avatar: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=400&fit=crop",
    platform: "Website",
    type: "Content Update",
    priority: "medium",
    title: "Complete Homepage Redesign - Enterprise Focus",
    summary: "InnovateNow has shifted their messaging and design toward enterprise customers, adding case studies and ROI calculators.",
    keyPoints: [
      "New enterprise-focused design language",
      "Added Fortune 500 client logos",
      "Interactive ROI calculator prominently displayed",
      "Removed SMB-focused messaging"
    ],
    sentiment: "neutral",
    aiInsight: "They're moving upmarket. This creates an opportunity for us to capture their abandoned SMB segment.",
    timestamp: "1 day ago",
    source: "https://innovatenow.com",
  },
  {
    id: 4,
    competitor: "CloudScale",
    avatar: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
    platform: "Reddit",
    type: "Community Discussion",
    priority: "medium",
    title: "Performance Issues and Downtime Reports",
    summary: "Multiple users reporting significant performance degradation and downtime over the past week on r/SaaS.",
    keyPoints: [
      "15+ user complaints in the last 7 days",
      "Average downtime reported: 4-6 hours",
      "Poor customer support response",
      "Users actively seeking alternatives"
    ],
    sentiment: "opportunity",
    aiInsight: "This is an excellent opportunity for customer acquisition. Launch a targeted campaign offering migration support.",
    timestamp: "2 days ago",
    source: "https://reddit.com/r/SaaS/comments/...",
  },
  {
    id: 5,
    competitor: "TechCorp",
    avatar: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=400&h=400&fit=crop",
    platform: "BlueSky",
    type: "Marketing Campaign",
    priority: "low",
    title: "New Content Marketing Series Launched",
    summary: "TechCorp started a weekly thought leadership series on AI and automation trends.",
    keyPoints: [
      "Weekly posts every Tuesday",
      "Focus on AI implementation strategies",
      "Strong engagement (avg 500+ interactions)",
      "Featuring industry experts and customers"
    ],
    sentiment: "neutral",
    aiInsight: "Quality content marketing initiative. Consider launching a competing series with deeper technical insights.",
    timestamp: "3 days ago",
    source: "https://bsky.app/profile/techcorp",
  },
]

const priorityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const

const sentimentConfig = {
  threat: {
    icon: TrendingDown,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
    label: "Threat"
  },
  opportunity: {
    icon: TrendingUp,
    color: "text-green-600",
    bgColor: "bg-green-50 dark:bg-green-950",
    label: "Opportunity"
  },
  neutral: {
    icon: AlertCircle,
    color: "text-muted-foreground",
    bgColor: "bg-muted",
    label: "Neutral"
  },
}

export function InsightsList() {
  return (
    <div className="space-y-6">
      {insights.map((insight) => {
        const SentimentIcon = sentimentConfig[insight.sentiment].icon
        
        return (
          <Card key={insight.id}>
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={insight.avatar} alt={insight.competitor} />
                  <AvatarFallback>{insight.competitor[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <CardTitle className="text-xl">{insight.title}</CardTitle>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium">{insight.competitor}</span>
                        <Separator orientation="vertical" className="h-4" />
                        <Badge variant="outline" className="text-xs">
                          {insight.platform}
                        </Badge>
                        <Badge variant={priorityColors[insight.priority]} className="text-xs">
                          {insight.type}
                        </Badge>
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${sentimentConfig[insight.sentiment].bgColor} ${sentimentConfig[insight.sentiment].color}`}>
                          <SentimentIcon className="h-3 w-3" />
                          {sentimentConfig[insight.sentiment].label}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <a href={insight.source} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{insight.summary}</p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-semibold">Key Points:</h4>
                <ul className="space-y-1 ml-4">
                  {insight.keyPoints.map((point, index) => (
                    <li key={index} className="text-sm text-muted-foreground list-disc">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>

              <div className={`p-4 rounded-lg ${sentimentConfig[insight.sentiment].bgColor} border`}>
                <div className="flex items-start gap-2">
                  <Sparkles className={`h-4 w-4 mt-0.5 ${sentimentConfig[insight.sentiment].color}`} />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold">AI Insight</p>
                    <p className="text-sm">{insight.aiInsight}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-xs text-muted-foreground">{insight.timestamp}</span>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    Create Action Item
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}