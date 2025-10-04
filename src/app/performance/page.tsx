"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { toast } from "sonner";

interface Competitor {
  id: number;
  name: string;
  industry?: string;
}

interface Insight {
  id: number;
  competitorId: number;
  labels?: string[];
  publicOpinionPositive?: number;
  publicOpinionNegative?: number;
  keyPoints?: string[];
}

interface PerformanceMetrics {
  competitorName: string;
  totalInsights: number;
  avgPositiveSentiment: number;
  avgNegativeSentiment: number;
  topStrengths: string[];
  topWeaknesses: string[];
  recentActivity: string[];
}

export default function PerformancePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState<PerformanceMetrics[]>([]);

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

      if (competitorsRes.ok && insightsRes.ok) {
        const competitorsData = await competitorsRes.json();
        const insightsData = await insightsRes.json();
        
        setCompetitors(competitorsData);
        setInsights(insightsData);
        
        // Process performance data
        const metrics = calculatePerformanceMetrics(competitorsData, insightsData);
        setPerformanceData(metrics);
      }
    } catch (error) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const calculatePerformanceMetrics = (
    competitors: Competitor[],
    insights: Insight[]
  ): PerformanceMetrics[] => {
    return competitors.map((competitor) => {
      const competitorInsights = insights.filter(
        (i) => i.competitorId === competitor.id
      );

      const avgPositive =
        competitorInsights.length > 0
          ? Math.round(
              competitorInsights.reduce(
                (sum, i) => sum + (i.publicOpinionPositive || 0),
                0
              ) / competitorInsights.length
            )
          : 0;

      const avgNegative =
        competitorInsights.length > 0
          ? Math.round(
              competitorInsights.reduce(
                (sum, i) => sum + (i.publicOpinionNegative || 0),
                0
              ) / competitorInsights.length
            )
          : 0;

      // Extract strengths from key points with positive sentiment
      const allKeyPoints = competitorInsights
        .filter((i) => (i.publicOpinionPositive || 0) > 50)
        .flatMap((i) => i.keyPoints || []);
      const topStrengths = [...new Set(allKeyPoints)].slice(0, 3);

      // Extract weaknesses from key points with negative sentiment
      const allWeaknesses = competitorInsights
        .filter((i) => (i.publicOpinionNegative || 0) > 50)
        .flatMap((i) => i.keyPoints || []);
      const topWeaknesses = [...new Set(allWeaknesses)].slice(0, 3);

      // Get recent activity labels
      const recentActivity = [
        ...new Set(
          competitorInsights
            .slice(0, 5)
            .flatMap((i) => i.labels || [])
        ),
      ];

      return {
        competitorName: competitor.name,
        totalInsights: competitorInsights.length,
        avgPositiveSentiment: avgPositive,
        avgNegativeSentiment: avgNegative,
        topStrengths,
        topWeaknesses,
        recentActivity,
      };
    });
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
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Performance Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Compare your company's position against competitors based on AI analysis
          </p>
        </div>

        {performanceData.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">
                No performance data available. Add competitors and generate insights to see analysis.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Competitor Performance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Competitor</TableHead>
                      <TableHead className="text-center">Insights</TableHead>
                      <TableHead className="text-center">Public Sentiment</TableHead>
                      <TableHead className="text-center">Activity</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceData.map((data) => (
                      <TableRow key={data.competitorName}>
                        <TableCell className="font-medium">
                          {data.competitorName}
                        </TableCell>
                        <TableCell className="text-center">
                          {data.totalInsights}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-4">
                            <div className="flex items-center gap-1">
                              <TrendingUp className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">
                                {data.avgPositiveSentiment}%
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingDown className="h-4 w-4 text-red-600" />
                              <span className="text-sm text-red-600">
                                {data.avgNegativeSentiment}%
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {data.recentActivity.slice(0, 3).map((activity, idx) => (
                              <Badge key={idx} variant="outline" className="text-xs">
                                {activity}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {performanceData.map((data) => (
                <Card key={data.competitorName}>
                  <CardHeader>
                    <CardTitle>{data.competitorName}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {data.topStrengths.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">
                          What People Like:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {data.topStrengths.map((strength, idx) => (
                            <li key={idx}>{strength}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.topWeaknesses.length > 0 && (
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">
                          What Your Company Lacks / Could Improve:
                        </h4>
                        <ul className="list-disc list-inside space-y-1 text-sm">
                          {data.topWeaknesses.map((weakness, idx) => (
                            <li key={idx}>{weakness}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {data.topStrengths.length === 0 && data.topWeaknesses.length === 0 && (
                      <p className="text-sm text-muted-foreground">
                        Not enough data to analyze strengths and weaknesses yet.
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}