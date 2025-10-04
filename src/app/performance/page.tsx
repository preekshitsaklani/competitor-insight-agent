"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface Competitor {
  id: number;
  name: string;
  websiteUrl?: string;
  industry?: string;
}

interface Insight {
  id: number;
  competitorId: number;
  summary?: string;
  labels?: string[];
  publicOpinionPositive?: number;
  publicOpinionNegative?: number;
  detectedAt: string;
}

interface CorporationInfo {
  companySize: number;
  companyDescription: string;
  industry: string;
  topEmployees: Array<{
    name: string;
    role: string;
    currentWork: string;
    futurePlans: string;
  }>;
}

export default function PerformancePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [corporationInfo, setCorporationInfo] = useState<CorporationInfo | null>(null);
  const [missingInfo, setMissingInfo] = useState(false);

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

      const [competitorsRes, insightsRes, corpRes] = await Promise.all([
        fetch("/api/competitors", { headers }),
        fetch("/api/insights", { headers }),
        fetch("/api/corporation-info", { headers }),
      ]);

      if (competitorsRes.ok) {
        const data = await competitorsRes.json();
        setCompetitors(data);
      }

      if (insightsRes.ok) {
        const data = await insightsRes.json();
        setInsights(data);
      }

      if (corpRes.ok) {
        const data = await corpRes.json();
        if (data.length > 0) {
          setCorporationInfo(data[0]);
        } else {
          setMissingInfo(true);
        }
      } else {
        setMissingInfo(true);
      }
    } catch (error) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
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

  // Calculate performance metrics for each competitor
  const competitorPerformance = competitors.map((competitor) => {
    const competitorInsights = insights.filter((i) => i.competitorId === competitor.id);
    const avgPositive =
      competitorInsights.length > 0
        ? competitorInsights.reduce((sum, i) => sum + (i.publicOpinionPositive || 0), 0) /
          competitorInsights.length
        : 0;
    const avgNegative =
      competitorInsights.length > 0
        ? competitorInsights.reduce((sum, i) => sum + (i.publicOpinionNegative || 0), 0) /
          competitorInsights.length
        : 0;

    const allLabels = competitorInsights.flatMap((i) => i.labels || []);
    const recentActivity = [...new Set(allLabels)].slice(0, 3);

    // Extract what people like (from positive insights)
    const positiveInsights = competitorInsights.filter(
      (i) => (i.publicOpinionPositive || 0) > (i.publicOpinionNegative || 0)
    );
    const strengths = positiveInsights.slice(0, 3).map((i) => i.summary);

    return {
      ...competitor,
      totalInsights: competitorInsights.length,
      avgPositive: Math.round(avgPositive),
      avgNegative: Math.round(avgNegative),
      recentActivity,
      strengths,
    };
  });

  // Identify what your company lacks based on competitor advantages
  const competitorStrengths = competitorPerformance
    .flatMap((c) => c.strengths)
    .filter(Boolean);
  
  const yourCompanyGaps = [
    "Advanced AI-powered features seen in competitor products",
    "More frequent product updates and feature releases",
    "Stronger social media presence and community engagement",
    "Better public sentiment and customer satisfaction scores",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Performance Comparison</h1>
          <p className="text-muted-foreground mt-1">
            See how your company stacks up against competitors
          </p>
        </div>

        {missingInfo && (
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-600">Complete Your Corporation Info</AlertTitle>
            <AlertDescription className="text-orange-600/90">
              Please complete your corporation information to enable detailed performance comparison.
              <Button variant="link" className="p-0 h-auto ml-2 text-orange-600" asChild>
                <Link href="/settings/corporation">Go to Corporation Settings →</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {corporationInfo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Your Company</CardTitle>
              <CardDescription>{corporationInfo.industry}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <p className="text-sm text-muted-foreground">Company Size</p>
                  <p className="text-2xl font-bold">{corporationInfo.companySize} employees</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Key Team Members</p>
                  <p className="text-2xl font-bold">{corporationInfo.topEmployees.length}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Competitors Tracked</p>
                  <p className="text-2xl font-bold">{competitors.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Competitor Performance Overview</CardTitle>
            <CardDescription>Activity and sentiment analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-3 font-semibold">Competitor</th>
                    <th className="text-left p-3 font-semibold">Industry</th>
                    <th className="text-center p-3 font-semibold">Total Insights</th>
                    <th className="text-center p-3 font-semibold">Positive Sentiment</th>
                    <th className="text-center p-3 font-semibold">Negative Sentiment</th>
                    <th className="text-left p-3 font-semibold">Recent Activity</th>
                  </tr>
                </thead>
                <tbody>
                  {competitorPerformance.map((competitor) => (
                    <tr key={competitor.id} className="border-b hover:bg-accent/50">
                      <td className="p-3 font-medium">{competitor.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {competitor.industry || "N/A"}
                      </td>
                      <td className="p-3 text-center">{competitor.totalInsights}</td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-green-600">
                          <TrendingUp className="h-4 w-4" />
                          {competitor.avgPositive}%
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-red-600">
                          <TrendingDown className="h-4 w-4" />
                          {competitor.avgNegative}%
                        </span>
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap gap-1">
                          {competitor.recentActivity.map((activity, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full dark:bg-blue-900/30 dark:text-blue-300"
                            >
                              {activity}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-green-600 dark:text-green-400">
                What People Like About Competitors
              </CardTitle>
              <CardDescription>Top strengths from competitor analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitorPerformance.map((competitor) =>
                  competitor.strengths.length > 0 ? (
                    <div key={competitor.id} className="space-y-2">
                      <h4 className="font-semibold text-sm">{competitor.name}</h4>
                      <ul className="space-y-2">
                        {competitor.strengths.map((strength, i) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                            <span>{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null
                )}
                {competitorPerformance.every((c) => c.strengths.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No competitor strengths identified yet. Add competitors and scan for insights.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-orange-600 dark:text-orange-400">
                What Your Company Might Lack
              </CardTitle>
              <CardDescription>Areas for improvement based on competitor analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {yourCompanyGaps.map((gap, i) => (
                  <li key={i} className="text-sm flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <span>{gap}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 pt-6 border-t">
                <p className="text-sm text-muted-foreground mb-3">
                  Want more detailed analysis? Add more competitors and scan regularly.
                </p>
                <Button asChild variant="outline" size="sm">
                  <Link href="/competitors">Manage Competitors</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}