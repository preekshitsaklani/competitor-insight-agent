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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/lib/auth-client";

interface DiscoveredCompetitor {
  name: string;
  websiteUrl: string;
  industry: string;
  description: string;
  socialAccounts: Array<{
    platform: string;
    url: string;
    handle: string;
  }>;
}

export function AIDiscoveryDialog({
  open,
  onOpenChange,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [companyDescription, setCompanyDescription] = useState("");
  const [discoveredCompetitors, setDiscoveredCompetitors] = useState<DiscoveredCompetitor[]>([]);
  const [adding, setAdding] = useState<Set<number>>(new Set());

  const handleDiscover = async () => {
    if (!companyDescription.trim()) {
      toast.error("Please describe your company");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/ai/discover-competitors", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyDescription,
          userId: session?.user?.id,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to discover competitors");
      }

      const data = await res.json();
      setDiscoveredCompetitors(data.competitors);
      toast.success(`Found ${data.competitors.length} potential competitors!`);
    } catch (error) {
      toast.error("Failed to discover competitors");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCompetitor = async (competitor: DiscoveredCompetitor, index: number) => {
    setAdding(new Set(adding).add(index));
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
          name: competitor.name,
          websiteUrl: competitor.websiteUrl,
          industry: competitor.industry,
          monitoringFrequency: "daily",
          status: "active",
        }),
      });

      if (!competitorRes.ok) {
        throw new Error("Failed to add competitor");
      }

      const newCompetitor = await competitorRes.json();

      // Add social accounts
      for (const social of competitor.socialAccounts) {
        await fetch("/api/social-accounts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            competitorId: newCompetitor.id,
            platform: social.platform,
            handle: social.handle,
            url: social.url,
            isActive: true,
          }),
        });
      }

      // Auto-trigger scanning
      await fetch("/api/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          competitorId: newCompetitor.id,
        }),
      });

      toast.success(`${competitor.name} added and scanning started!`);
      onSuccess();
    } catch (error) {
      toast.error(`Failed to add ${competitor.name}`);
    } finally {
      const newAdding = new Set(adding);
      newAdding.delete(index);
      setAdding(newAdding);
    }
  };

  const handleAddAll = async () => {
    for (let i = 0; i < discoveredCompetitors.length; i++) {
      await handleAddCompetitor(discoveredCompetitors[i], i);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Competitor Discovery
          </DialogTitle>
          <DialogDescription>
            Let AI find your competitors based on your company description
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description">What does your company do?</Label>
            <Textarea
              id="description"
              value={companyDescription}
              onChange={(e) => setCompanyDescription(e.target.value)}
              placeholder="E.g., We provide AI-powered project management software for remote teams, focusing on automation and intelligent task prioritization..."
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-muted-foreground">
              Be specific about your product, target market, and key features for better results
            </p>
          </div>

          <Button
            onClick={handleDiscover}
            disabled={loading || !companyDescription.trim()}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Discovering Competitors...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Discover Competitors
              </>
            )}
          </Button>

          {discoveredCompetitors.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">
                  Found {discoveredCompetitors.length} Competitors
                </h4>
                <Button onClick={handleAddAll} variant="outline" size="sm">
                  Add All
                </Button>
              </div>

              <div className="space-y-3">
                {discoveredCompetitors.map((competitor, index) => (
                  <div
                    key={index}
                    className="p-4 border rounded-lg space-y-3 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-2">
                        <div>
                          <h5 className="font-semibold text-lg">{competitor.name}</h5>
                          <p className="text-sm text-muted-foreground">
                            {competitor.industry}
                          </p>
                        </div>
                        <p className="text-sm">{competitor.description}</p>
                        {competitor.websiteUrl && (
                          <a
                            href={competitor.websiteUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-600 hover:underline"
                          >
                            {competitor.websiteUrl}
                          </a>
                        )}
                        {competitor.socialAccounts.length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {competitor.socialAccounts.map((social, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                              >
                                {social.platform}: {social.handle}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleAddCompetitor(competitor, index)}
                        disabled={adding.has(index)}
                        size="sm"
                      >
                        {adding.has(index) ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Add & Scan
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}