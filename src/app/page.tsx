"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Target, Bell, Activity, Plus, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Competitor {
  id: number;
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  industry?: string;
  status: string;
  monitoringFrequency: string;
}

interface Insight {
  id: number;
  competitorId: number;
  summary?: string;
  insightType: string;
  sentiment: string;
  priority: string;
  detectedAt: string;
}

export default function DashboardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [missingInfo, setMissingInfo] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchData();
      checkCompanyInfo();
    }
  }, [session]);

  const checkCompanyInfo = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const [userRes, corpRes] = await Promise.all([
        fetch("/api/users", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/corporation-info", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (userRes.ok && corpRes.ok) {
        const userData = await userRes.json();
        const corpData = await corpRes.json();

        const hasUserInfo = userData.companyWebsite && userData.phone;
        const hasCorpInfo = corpData.length > 0 && corpData[0].companySize > 0;

        if (!hasUserInfo || !hasCorpInfo) {
          setMissingInfo(true);
        }
      }
    } catch (error) {
      console.error("Failed to check company info");
    }
  };

  const fetchData = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };

      const [competitorsRes, insightsRes] = await Promise.all([
        fetch("/api/competitors", { headers }),
        fetch("/api/insights?limit=5", { headers }),
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
      toast.error("Failed to load dashboard data");
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

  const activeCompetitors = competitors.filter((c) => c.status === "active").length;
  const highPriorityInsights = insights.filter((i) => i.priority === "high").length;
  const threatInsights = insights.filter((i) => i.sentiment === "threat").length;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        {missingInfo && (
          <Alert className="mb-6 border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
            <AlertCircle className="h-4 w-4 text-orange-600" />
            <AlertTitle className="text-orange-600">Complete Your Profile</AlertTitle>
            <AlertDescription className="text-orange-600/90">
              Please complete your company information in settings to enable full competitor tracking features.
              <Button variant="link" className="p-0 h-auto ml-2 text-orange-600" asChild>
                <Link href="/settings/corporation">Go to Settings →</Link>
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Monitor your competitors and track market intelligence
            </p>
          </div>
          <Button asChild>
            <Link href="/competitors">
              <Plus className="mr-2 h-4 w-4" />
              Add Competitor
            </Link>
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Competitors</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeCompetitors}</div>
              <p className="text-xs text-muted-foreground">
                {competitors.length} total tracked
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Insights</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{insights.length}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">High Priority</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{highPriorityInsights}</div>
              <p className="text-xs text-muted-foreground">Require attention</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{threatInsights}</div>
              <p className="text-xs text-muted-foreground">This week</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Insights</CardTitle>
          </CardHeader>
          <CardContent>
            {competitors.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No competitors tracked yet. Add your first competitor to start monitoring.
                </p>
                <Button asChild>
                  <Link href="/competitors">Add Your First Competitor</Link>
                </Button>
              </div>
            ) : insights.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  No insights generated yet. Our AI is analyzing your competitors...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {insights.map((insight) => {
                  const competitor = competitors.find((c) => c.id === insight.competitorId);
                  return (
                    <div
                      key={insight.id}
                      className="flex items-start space-x-4 p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold">{competitor?.name}</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.sentiment === "threat"
                              ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300"
                              : insight.sentiment === "opportunity"
                              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {insight.sentiment}
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            insight.priority === "high"
                              ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300"
                              : insight.priority === "medium"
                              ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                          }`}>
                            {insight.priority}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">{insight.summary}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(insight.detectedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div className="text-center pt-4">
                  <Button variant="outline" asChild>
                    <Link href="/insights">View All Insights</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}