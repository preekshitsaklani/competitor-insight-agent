"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Mail, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailEnabled: true,
    emailFrequency: "daily",
    slackEnabled: false,
    slackWebhookUrl: "",
    preferredDeliveryTime: "09:00",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchSettings();
    }
  }, [session]);

  const fetchSettings = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/user-settings", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setSettings({
          emailEnabled: data.emailEnabled,
          emailFrequency: data.emailFrequency,
          slackEnabled: data.slackEnabled,
          slackWebhookUrl: data.slackWebhookUrl || "",
          preferredDeliveryTime: data.preferredDeliveryTime,
        });
      }
    } catch (error) {
      // Settings don't exist yet, use defaults
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/user-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success("Settings saved successfully");
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground mt-1">
            Configure your notification preferences and delivery channels
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Configure how you receive intelligence digests via email
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="emailEnabled">Enable Email Digest</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive competitive intelligence via email
                  </p>
                </div>
                <Switch
                  id="emailEnabled"
                  checked={settings.emailEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, emailEnabled: checked })
                  }
                />
              </div>

              {settings.emailEnabled && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="emailFrequency">Delivery Frequency</Label>
                    <Select
                      value={settings.emailFrequency}
                      onValueChange={(value) =>
                        setSettings({ ...settings, emailFrequency: value })
                      }
                    >
                      <SelectTrigger id="emailFrequency">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deliveryTime">Preferred Delivery Time</Label>
                    <Input
                      id="deliveryTime"
                      type="time"
                      value={settings.preferredDeliveryTime}
                      onChange={(e) =>
                        setSettings({ ...settings, preferredDeliveryTime: e.target.value })
                      }
                    />
                    <p className="text-sm text-muted-foreground">
                      Time is in your local timezone
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Slack Integration
              </CardTitle>
              <CardDescription>
                Send insights directly to your Slack workspace
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="slackEnabled">Enable Slack Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Post insights to a Slack channel
                  </p>
                </div>
                <Switch
                  id="slackEnabled"
                  checked={settings.slackEnabled}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, slackEnabled: checked })
                  }
                />
              </div>

              {settings.slackEnabled && (
                <div className="space-y-2">
                  <Label htmlFor="slackWebhook">Slack Webhook URL</Label>
                  <Input
                    id="slackWebhook"
                    type="url"
                    placeholder="https://hooks.slack.com/services/..."
                    value={settings.slackWebhookUrl}
                    onChange={(e) =>
                      setSettings({ ...settings, slackWebhookUrl: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    <a
                      href="https://api.slack.com/messaging/webhooks"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Learn how to create a Slack webhook
                    </a>
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}