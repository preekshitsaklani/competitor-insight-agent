"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Mail, MessageSquare, Bell, Clock } from "lucide-react"

export function NotificationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Email Notifications</CardTitle>
          <CardDescription>
            Configure how you receive email notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="email-enabled">Enable Email Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Receive insights and alerts via email
              </p>
            </div>
            <Switch id="email-enabled" defaultChecked />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="high-priority-email">High Priority Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Immediate notification for high-priority changes
                </p>
              </div>
              <Switch id="high-priority-email" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="daily-digest">Daily Digest</Label>
                <p className="text-sm text-muted-foreground">
                  Summary of all insights from the day
                </p>
              </div>
              <Switch id="daily-digest" defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="weekly-summary">Weekly Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Comprehensive weekly competitive analysis
                </p>
              </div>
              <Switch id="weekly-summary" />
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="email-frequency">Digest Frequency</Label>
            <Select defaultValue="daily">
              <SelectTrigger id="email-frequency">
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="realtime">Real-time (Immediate)</SelectItem>
                <SelectItem value="hourly">Hourly Summary</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Report</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="digest-time">Preferred Delivery Time</Label>
            <Select defaultValue="9am">
              <SelectTrigger id="digest-time">
                <SelectValue placeholder="Select time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="6am">6:00 AM</SelectItem>
                <SelectItem value="9am">9:00 AM</SelectItem>
                <SelectItem value="12pm">12:00 PM</SelectItem>
                <SelectItem value="3pm">3:00 PM</SelectItem>
                <SelectItem value="6pm">6:00 PM</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Slack Notifications</CardTitle>
          <CardDescription>
            Get insights delivered directly to your Slack workspace
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="slack-enabled">Enable Slack Notifications</Label>
              </div>
              <p className="text-sm text-muted-foreground">
                Send insights to your Slack channel
              </p>
            </div>
            <Switch id="slack-enabled" />
          </div>

          <Separator />

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="slack-high-priority">High Priority Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Instant Slack messages for critical insights
                </p>
              </div>
              <Switch id="slack-high-priority" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="slack-daily">Daily Summary</Label>
                <p className="text-sm text-muted-foreground">
                  Daily digest posted to Slack
                </p>
              </div>
              <Switch id="slack-daily" />
            </div>
          </div>

          <Button variant="outline" className="w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Connect Slack Workspace
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Alert Preferences</CardTitle>
          <CardDescription>
            Customize which types of changes trigger notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alert-product-launch">Product Launches</Label>
              <p className="text-sm text-muted-foreground">
                New product announcements
              </p>
            </div>
            <Switch id="alert-product-launch" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alert-pricing">Pricing Changes</Label>
              <p className="text-sm text-muted-foreground">
                Price updates and discount campaigns
              </p>
            </div>
            <Switch id="alert-pricing" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alert-features">Feature Updates</Label>
              <p className="text-sm text-muted-foreground">
                New features and improvements
              </p>
            </div>
            <Switch id="alert-features" defaultChecked />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alert-content">Content Changes</Label>
              <p className="text-sm text-muted-foreground">
                Website and marketing material updates
              </p>
            </div>
            <Switch id="alert-content" />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="alert-social">Social Media Activity</Label>
              <p className="text-sm text-muted-foreground">
                Posts and campaigns on social platforms
              </p>
            </div>
            <Switch id="alert-social" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset to Defaults</Button>
        <Button>Save Changes</Button>
      </div>
    </div>
  )
}