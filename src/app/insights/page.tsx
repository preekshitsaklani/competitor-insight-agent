"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ExternalLink, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Competitor {
  id: number;
  name: string;
}

interface Insight {
  id: number;
  competitorId: number;
  summary?: string;
  insightType: string;
  sentiment: string;
  priority: string;
  detectedAt: string;
  sourceUrl?: string;
  keyPoints?: string[];
  recommendations?: string[];
  labels?: string[];
  publicOpinionPositive?: number;
  publicOpinionNegative?: number;
  platform?: string;
}

export default function InsightsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    competitor: "all",
    sentiment: "all",
    priority: "all",
    type: "all",
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
    }
  }, [session]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [competitorsRes, insightsRes] = await Promise.all([
        fetch("/api/competitors", { headers }),
        fetch("/api/insights", { headers }),
      ]);

      if (competitorsRes.ok) {
        const competitorsData = await competitorsRes.json();
        setCompetitors(competitorsData);
      }

      if (insightsRes.ok) {
        const insightsData = await insightsRes.json();
        setInsights(insightsData);
      }
    } catch (error) {
      console.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const filteredInsights = insights.filter((insight) => {
    const matchesSearch =
      searchTerm === "" ||
      insight.summary?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insight.insightType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCompetitor =
      filters.competitor === "all" ||
      insight.competitorId === parseInt(filters.competitor);

    const matchesSentiment =
      filters.sentiment === "all" || insight.sentiment === filters.sentiment;

    const matchesPriority =
      filters.priority === "all" || insight.priority === filters.priority;

    const matchesType =
      filters.type === "all" || insight.insightType === filters.type;

    return (
      matchesSearch &&
      matchesCompetitor &&
      matchesSentiment &&
      matchesPriority &&
      matchesType
    );
  });

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
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Insights</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered competitive intelligence and market insights
          </p>
        </div>

        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search insights..."
                    className="pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <div className="w-full sm:w-40">
                  <Select
                    value={filters.competitor}
                    onValueChange={(value) =>
                      setFilters({ ...filters, competitor: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Competitor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All competitors</SelectItem>
                      {competitors.map((competitor) => (
                        <SelectItem key={competitor.id} value={competitor.id.toString()}>
                          {competitor.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-40">
                  <Select
                    value={filters.sentiment}
                    onValueChange={(value) =>
                      setFilters({ ...filters, sentiment: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sentiment" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All sentiments</SelectItem>
                      <SelectItem value="threat">Threat</SelectItem>
                      <SelectItem value="opportunity">Opportunity</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-40">
                  <Select
                    value={filters.priority}
                    onValueChange={(value) =>
                      setFilters({ ...filters, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All priorities</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="w-full sm:w-40">
                  <Select
                    value={filters.type}
                    onValueChange={(value) => setFilters({ ...filters, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All types</SelectItem>
                      <SelectItem value="product-launch">Product Launch</SelectItem>
                      <SelectItem value="feature-update">Feature Update</SelectItem>
                      <SelectItem value="marketing-campaign">Marketing Campaign</SelectItem>
                      <SelectItem value="pricing-change">Pricing Change</SelectItem>
                      <SelectItem value="content-update">Content Update</SelectItem>
                      <SelectItem value="community-discussion">
                        Community Discussion
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {filteredInsights.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">
                  No insights found. {insights.length === 0 ? "Add competitors to start tracking." : "Try adjusting your filters."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredInsights.map((insight) => {
              const competitor = competitors.find((c) => c.id === insight.competitorId);
              return (
                <Card key={insight.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-lg">{competitor?.name}</h3>
                          
                          {insight.labels && insight.labels.length > 0 && (
                            <>
                              {insight.labels.map((label, idx) => (
                                <Badge key={idx} variant="default" className="bg-blue-600">
                                  {label}
                                </Badge>
                              ))}
                            </>
                          )}
                          
                          <Badge variant={insight.sentiment === "threat" ? "destructive" : insight.sentiment === "opportunity" ? "default" : "secondary"}>
                            {insight.sentiment}
                          </Badge>
                          <Badge variant={insight.priority === "high" ? "destructive" : insight.priority === "medium" ? "default" : "secondary"}>
                            {insight.priority}
                          </Badge>
                          {insight.platform && <Badge variant="outline">{insight.platform}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(insight.detectedAt).toLocaleDateString()} • {new Date(insight.detectedAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {insight.summary && (
                      <p className="text-foreground">{insight.summary}</p>
                    )}

                    {insight.keyPoints && insight.keyPoints.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Key Points:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {insight.keyPoints.map((point, i) => (
                            <li key={i}>{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {insight.recommendations && insight.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2">Recommendations:</h4>
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {insight.recommendations.map((rec, i) => (
                            <li key={i}>{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {(insight.publicOpinionPositive !== undefined || insight.publicOpinionNegative !== undefined) && (
                      <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="h-4 w-4 text-green-600" />
                          <span className="text-green-600">{insight.publicOpinionPositive || 0}% positive</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <ThumbsDown className="h-4 w-4 text-red-600" />
                          <span className="text-red-600">{insight.publicOpinionNegative || 0}% negative</span>
                        </div>
                      </div>
                    )}

                    {insight.sourceUrl && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={insight.sourceUrl} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          View Source
                        </a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
}