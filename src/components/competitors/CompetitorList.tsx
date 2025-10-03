"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Globe, Linkedin, Twitter, Facebook, Instagram } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const competitors = [
  {
    id: 1,
    name: "TechCorp",
    logo: "https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=400&h=400&fit=crop",
    website: "techcorp.com",
    description: "Leading enterprise software provider",
    monitoring: ["Website", "LinkedIn", "Twitter"],
    frequency: "Daily",
    status: "active",
    lastChecked: "2 hours ago",
  },
  {
    id: 2,
    name: "StartupX",
    logo: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=400&h=400&fit=crop",
    website: "startupx.io",
    description: "Fast-growing SaaS startup",
    monitoring: ["Website", "Twitter", "Reddit"],
    frequency: "Daily",
    status: "active",
    lastChecked: "4 hours ago",
  },
  {
    id: 3,
    name: "InnovateNow",
    logo: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?w=400&h=400&fit=crop",
    website: "innovatenow.com",
    description: "Innovation consulting firm",
    monitoring: ["Website", "LinkedIn", "Facebook"],
    frequency: "Weekly",
    status: "active",
    lastChecked: "1 day ago",
  },
  {
    id: 4,
    name: "CloudScale",
    logo: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=400&fit=crop",
    website: "cloudscale.tech",
    description: "Cloud infrastructure provider",
    monitoring: ["Website", "LinkedIn", "Twitter", "Reddit"],
    frequency: "Daily",
    status: "active",
    lastChecked: "6 hours ago",
  },
]

export function CompetitorList() {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {competitors.map((competitor) => (
        <Card key={competitor.id}>
          <CardHeader className="flex flex-row items-start justify-between space-y-0">
            <div className="flex items-start gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={competitor.logo} alt={competitor.name} />
                <AvatarFallback>{competitor.name[0]}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <CardTitle className="text-base">{competitor.name}</CardTitle>
                <CardDescription className="text-xs">
                  {competitor.website}
                </CardDescription>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Edit</DropdownMenuItem>
                <DropdownMenuItem>View Insights</DropdownMenuItem>
                <DropdownMenuItem>Pause Monitoring</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {competitor.description}
            </p>
            
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1">
                {competitor.monitoring.map((platform) => (
                  <Badge key={platform} variant="secondary" className="text-xs">
                    {platform}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Frequency: <span className="font-medium text-foreground">{competitor.frequency}</span>
              </span>
              <Badge variant="outline" className="text-xs">
                {competitor.status}
              </Badge>
            </div>

            <div className="text-xs text-muted-foreground">
              Last checked: {competitor.lastChecked}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}