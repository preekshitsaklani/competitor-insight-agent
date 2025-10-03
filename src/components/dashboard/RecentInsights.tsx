"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"

const insights = [
  {
    id: 1,
    competitor: "TechCorp",
    avatar: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=400&h=400&fit=crop",
    platform: "LinkedIn",
    type: "Product Launch",
    title: "New AI Feature Announcement",
    description: "TechCorp announced a new AI-powered analytics dashboard with real-time insights and predictive modeling capabilities.",
    timestamp: "2 hours ago",
    priority: "high",
  },
  {
    id: 2,
    competitor: "StartupX",
    avatar: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
    platform: "Twitter",
    type: "Marketing Campaign",
    title: "Summer Sale Campaign Launched",
    description: "StartupX started an aggressive pricing campaign with 40% discount on annual plans.",
    timestamp: "5 hours ago",
    priority: "medium",
  },
  {
    id: 3,
    competitor: "InnovateNow",
    avatar: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=400&fit=crop",
    platform: "Website",
    type: "Feature Update",
    title: "Homepage Redesign Detected",
    description: "Major website redesign with focus on enterprise customers. Added case studies and ROI calculator.",
    timestamp: "1 day ago",
    priority: "medium",
  },
  {
    id: 4,
    competitor: "CloudScale",
    avatar: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
    platform: "Reddit",
    type: "Community Discussion",
    title: "Product Issues Discussed on r/SaaS",
    description: "Users reporting performance issues and downtime. Negative sentiment detected in comments.",
    timestamp: "2 days ago",
    priority: "low",
  },
]

const priorityColors = {
  high: "destructive",
  medium: "default",
  low: "secondary",
} as const

export function RecentInsights() {
  return (
    <Card className="col-span-4 lg:col-span-3">
      <CardHeader>
        <CardTitle>Recent Insights</CardTitle>
        <CardDescription>
          Latest competitive intelligence from monitored sources
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {insights.map((insight) => (
            <div key={insight.id} className="flex gap-4">
              <Avatar className="h-10 w-10">
                <AvatarImage src={insight.avatar} alt={insight.competitor} />
                <AvatarFallback>{insight.competitor[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-none">
                        {insight.competitor}
                      </p>
                      <Badge variant="outline" className="text-xs">
                        {insight.platform}
                      </Badge>
                      <Badge variant={priorityColors[insight.priority]} className="text-xs">
                        {insight.type}
                      </Badge>
                    </div>
                    <p className="text-sm font-semibold">{insight.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {insight.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {insight.timestamp}
                    </p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}