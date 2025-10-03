"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Mail, Webhook, Zap, CheckCircle2 } from "lucide-react"

const integrations = [
  {
    id: "slack",
    name: "Slack",
    description: "Get insights delivered to your Slack channels",
    icon: MessageSquare,
    connected: false,
    color: "bg-purple-500",
  },
  {
    id: "email",
    name: "Email (SendGrid)",
    description: "Reliable email delivery for digest notifications",
    icon: Mail,
    connected: true,
    color: "bg-blue-500",
  },
  {
    id: "mailgun",
    name: "Mailgun",
    description: "Alternative email delivery service",
    icon: Mail,
    connected: false,
    color: "bg-red-500",
  },
  {
    id: "webhooks",
    name: "Webhooks",
    description: "Send insights to your custom endpoints",
    icon: Webhook,
    connected: false,
    color: "bg-green-500",
  },
  {
    id: "zapier",
    name: "Zapier",
    description: "Connect to 5000+ apps and automate workflows",
    icon: Zap,
    connected: false,
    color: "bg-orange-500",
  },
]

export function IntegrationSettings() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>
            Connect external services to receive and manage competitive insights
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => {
              const Icon = integration.icon
              return (
                <div
                  key={integration.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-lg ${integration.color} flex items-center justify-center`}>
                      <Icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{integration.name}</p>
                        {integration.connected && (
                          <Badge variant="secondary" className="text-xs flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />
                            Connected
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {integration.description}
                      </p>
                    </div>
                  </div>
                  <Button variant={integration.connected ? "outline" : "default"}>
                    {integration.connected ? "Configure" : "Connect"}
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>API Access</CardTitle>
          <CardDescription>
            Manage API keys for programmatic access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 border rounded-lg space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Production API Key</p>
                <p className="text-sm text-muted-foreground font-mono">
                  ci_prod_••••••••••••••••
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">Regenerate</Button>
                <Button variant="outline" size="sm">Copy</Button>
              </div>
            </div>
          </div>

          <Button variant="outline">
            Generate New API Key
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}