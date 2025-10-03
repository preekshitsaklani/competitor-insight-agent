"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, Bell, Activity } from "lucide-react"

const stats = [
  {
    title: "Active Competitors",
    value: "12",
    description: "+2 from last month",
    icon: Users,
    trend: "up",
  },
  {
    title: "Changes Detected",
    value: "47",
    description: "In the last 7 days",
    icon: Activity,
    trend: "up",
  },
  {
    title: "Insights Generated",
    value: "23",
    description: "This week",
    icon: TrendingUp,
    trend: "up",
  },
  {
    title: "Active Alerts",
    value: "8",
    description: "Require attention",
    icon: Bell,
    trend: "neutral",
  },
]

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}