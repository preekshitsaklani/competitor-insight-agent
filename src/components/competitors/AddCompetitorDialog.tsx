"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";

const SOCIAL_PLATFORMS = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "Twitter/X" },
  { value: "facebook", label: "Facebook" },
  { value: "instagram", label: "Instagram" },
  { value: "reddit", label: "Reddit" },
  { value: "bluesky", label: "BlueSky" },
  { value: "truthsocial", label: "Truth Social" },
];

interface SocialAccount {
  platform: string;
  handle: string;
  url: string;
}

export function AddCompetitorDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    websiteUrl: "",
    industry: "",
    monitoringFrequency: "daily",
  });
  const [socialAccounts, setSocialAccounts] = useState<SocialAccount[]>([]);
  const [newSocial, setNewSocial] = useState({
    platform: "",
    handle: "",
    url: "",
  });

  const handleAddSocial = () => {
    if (!newSocial.platform || !newSocial.handle) {
      toast.error("Please fill in platform and handle");
      return;
    }

    setSocialAccounts([...socialAccounts, { ...newSocial }]);
    setNewSocial({ platform: "", handle: "", url: "" });
  };

  const handleRemoveSocial = (index: number) => {
    setSocialAccounts(socialAccounts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");

      // Create competitor
      const competitorRes = await fetch("/api/competitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          websiteUrl: formData.websiteUrl,
          industry: formData.industry,
          monitoringFrequency: formData.monitoringFrequency,
          status: "active",
        }),
      });

      if (!competitorRes.ok) {
        throw new Error("Failed to create competitor");
      }

      const competitor = await competitorRes.json();

      // Add social accounts
      for (const social of socialAccounts) {
        await fetch("/api/social-accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            competitorId: competitor.id,
            platform: social.platform,
            handle: social.handle,
            url: social.url,
            isActive: true,
          }),
        });
      }

      toast.success("Competitor added successfully!");
      setFormData({
        name: "",
        websiteUrl: "",
        industry: "",
        monitoringFrequency: "daily",
      });
      setSocialAccounts([]);
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error("Failed to add competitor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Competitor</DialogTitle>
          <DialogDescription>
            Enter competitor details and social media handles to start tracking
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Company Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Notion, Figma, Slack"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input
                id="websiteUrl"
                type="url"
                value={formData.websiteUrl}
                onChange={(e) =>
                  setFormData({ ...formData, websiteUrl: e.target.value })
                }
                placeholder="https://example.com"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="e.g., SaaS, E-commerce, FinTech"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="monitoringFrequency">Monitoring Frequency</Label>
              <Select
                value={formData.monitoringFrequency}
                onValueChange={(value) =>
                  setFormData({ ...formData, monitoringFrequency: value })
                }
                disabled={loading}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="realtime">Real-time</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="font-semibold">Social Media Accounts</h4>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>Platform</Label>
                <Select
                  value={newSocial.platform}
                  onValueChange={(value) =>
                    setNewSocial({ ...newSocial, platform: value })
                  }
                  disabled={loading}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select platform" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOCIAL_PLATFORMS.map((platform) => (
                      <SelectItem key={platform.value} value={platform.value}>
                        {platform.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Handle</Label>
                <Input
                  value={newSocial.handle}
                  onChange={(e) =>
                    setNewSocial({ ...newSocial, handle: e.target.value })
                  }
                  placeholder="@username"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label>URL (optional)</Label>
                <Input
                  value={newSocial.url}
                  onChange={(e) => setNewSocial({ ...newSocial, url: e.target.value })}
                  placeholder="Profile URL"
                  disabled={loading}
                />
              </div>
            </div>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddSocial}
              disabled={loading}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Social Account
            </Button>

            {socialAccounts.length > 0 && (
              <div className="space-y-2">
                {socialAccounts.map((social, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-medium capitalize">{social.platform}</span>
                      <span className="text-muted-foreground">{social.handle}</span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveSocial(index)}
                      disabled={loading}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Competitor"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}