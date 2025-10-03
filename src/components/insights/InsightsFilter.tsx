"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Filter } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export function InsightsFilter() {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search insights..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="w-full sm:w-40">
              <Select defaultValue="all-competitors">
                <SelectTrigger>
                  <SelectValue placeholder="Competitor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-competitors">All Competitors</SelectItem>
                  <SelectItem value="techcorp">TechCorp</SelectItem>
                  <SelectItem value="startupx">StartupX</SelectItem>
                  <SelectItem value="innovatenow">InnovateNow</SelectItem>
                  <SelectItem value="cloudscale">CloudScale</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select defaultValue="all-platforms">
                <SelectTrigger>
                  <SelectValue placeholder="Platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-platforms">All Platforms</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="twitter">Twitter/X</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="reddit">Reddit</SelectItem>
                  <SelectItem value="bluesky">BlueSky</SelectItem>
                  <SelectItem value="truthsocial">Truth Social</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select defaultValue="all-types">
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-types">All Types</SelectItem>
                  <SelectItem value="product-launch">Product Launch</SelectItem>
                  <SelectItem value="feature-update">Feature Update</SelectItem>
                  <SelectItem value="marketing">Marketing Campaign</SelectItem>
                  <SelectItem value="pricing">Pricing Change</SelectItem>
                  <SelectItem value="content">Content Update</SelectItem>
                  <SelectItem value="discussion">Community Discussion</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select defaultValue="all-priority">
                <SelectTrigger>
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-priority">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="w-full sm:w-40">
              <Select defaultValue="last-7-days">
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="yesterday">Yesterday</SelectItem>
                  <SelectItem value="last-7-days">Last 7 Days</SelectItem>
                  <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                  <SelectItem value="last-90-days">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}