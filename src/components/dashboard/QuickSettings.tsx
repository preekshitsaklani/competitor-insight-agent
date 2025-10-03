"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Mail, MessageSquare } from "lucide-react"

export function QuickSettings() {
  return (
    <Card className="col-span-4 lg:col-span-1">
      <CardHeader>
        <CardTitle>Quick Settings</CardTitle>
        <CardDescription>
          Manage your notification preferences
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="email-notifications">Email</Label>
            </div>
            <Switch id="email-notifications" defaultChecked />
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="slack-notifications">Slack</Label>
            </div>
            <Switch id="slack-notifications" />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="digest-frequency">Digest Frequency</Label>
          <Select defaultValue="daily">
            <SelectTrigger id="digest-frequency">
              <SelectValue placeholder="Select frequency" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="realtime">Real-time</SelectItem>
              <SelectItem value="daily">Daily</SelectItem>
              <SelectItem value="weekly">Weekly</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority-filter">Priority Filter</Label>
          <Select defaultValue="all">
            <SelectTrigger id="priority-filter">
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High Only</SelectItem>
              <SelectItem value="medium-high">Medium & High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button className="w-full">Save Preferences</Button>
      </CardContent>
    </Card>
  )
}