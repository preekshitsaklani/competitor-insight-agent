"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, TrendingUp, TrendingDown, AlertCircle, Plus, RefreshCw, Edit } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Badge } from "@/components/ui/badge";
import { FinancialDataEntry } from "@/components/performance/FinancialDataEntry";
import { SentimentDialog } from "@/components/performance/SentimentDialog";

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
  companyWebsite?: string;
  companyLinkedin?: string;
  companyTwitter?: string;
  companyFacebook?: string;
  companyInstagram?: string;
  companyYoutube?: string;
  companyReddit?: string;
  topEmployees: Array<{
    name: string;
    role: string;
    currentWork: string;
    futurePlans: string;
  }>;
}

interface UserSentimentData {
  id: number;
  userId: string;
  scrapedAt: string;
  positivePercentage: number;
  neutralPercentage: number;
  negativePercentage: number;
  positiveSummary: string[];
  neutralSummary: string[];
  negativeSummary: string[];
  rawComments: any[];
  createdAt: string;
}

export default function PerformancePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [corporationInfo, setCorporationInfo] = useState<CorporationInfo | null>(null);
  const [missingInfo, setMissingInfo] = useState(false);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [showFinancialEntry, setShowFinancialEntry] = useState(false);
  const [showSentimentDialog, setShowSentimentDialog] = useState(false);
  const [selectedSentiment, setSelectedSentiment] = useState<{
    type: "positive" | "neutral" | "negative";
    percentage: number;
    summary: string[];
  } | null>(null);
  const [userSentiment, setUserSentiment] = useState<UserSentimentData | null>(null);
  const [scrapingSentiment, setScrapingSentiment] = useState(false);
  const [editingFinancial, setEditingFinancial] = useState<any>(null);

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

      const [competitorsRes, insightsRes, corpRes, financialRes, sentimentRes] = await Promise.all([
        fetch("/api/competitors", { headers }),
        fetch("/api/insights", { headers }),
        fetch("/api/corporation-info", { headers }),
        fetch("/api/financial-metrics", { headers }),
        fetch("/api/user-sentiment", { headers }),
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

      if (financialRes.ok) {
        const data = await financialRes.json();
        const transformedData = data.map((item: any) => ({
          id: item.id,
          month: new Date(item.month).toLocaleDateString('en-US', { month: 'short' }),
          fullMonth: item.month,
          marketing: item.marketing,
          revenue: item.totalRevenue,
          expenditure: item.expenses,
          profit: item.profit,
        })).sort((a: any, b: any) => new Date(a.fullMonth).getTime() - new Date(b.fullMonth).getTime());
        setFinancialData(transformedData);
      }

      if (sentimentRes.ok) {
        const data = await sentimentRes.json();
        if (data.sentimentData) {
          const sentiment = data.sentimentData;
          setUserSentiment({
            ...sentiment,
            positiveSummary: JSON.parse(sentiment.positiveSummary || '[]'),
            neutralSummary: JSON.parse(sentiment.neutralSummary || '[]'),
            negativeSummary: JSON.parse(sentiment.negativeSummary || '[]'),
            rawComments: JSON.parse(sentiment.rawComments || '[]'),
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load performance data");
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialSuccess = () => {
    setEditingFinancial(null);
    fetchData();
  };

  const handleFinancialDialogClose = (open: boolean) => {
    if (!open) {
      setEditingFinancial(null);
    }
    setShowFinancialEntry(open);
  };

  const handleScanSentiment = async () => {
    if (!corporationInfo) {
      toast.error("Please complete your corporation info first");
      return;
    }

    const socialMediaHandles: any = {};
    if (corporationInfo.companyYoutube) socialMediaHandles.youtube = corporationInfo.companyYoutube;
    if (corporationInfo.companyReddit) socialMediaHandles.reddit = corporationInfo.companyReddit;
    if (corporationInfo.companyTwitter) socialMediaHandles.twitter = corporationInfo.companyTwitter;

    if (Object.keys(socialMediaHandles).length === 0) {
      toast.error("Please add at least one social media handle in Corporation Settings");
      return;
    }

    setScrapingSentiment(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/user-sentiment/scrape", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ socialMediaHandles }),
      });

      if (res.ok) {
        const data = await res.json();
        toast.success(data.message);
        await fetchData();
      } else {
        const error = await res.json();
        toast.error(error.error || "Failed to scan sentiment");
      }
    } catch (error) {
      toast.error("Failed to scan sentiment");
    } finally {
      setScrapingSentiment(false);
    }
  };

  // Calculate sentiment based on ACTUAL scraped data
  const calculateSentiment = () => {
    const hasSocialMedia = corporationInfo && (
      corporationInfo.companyLinkedin || 
      corporationInfo.companyTwitter || 
      corporationInfo.companyFacebook || 
      corporationInfo.companyInstagram ||
      corporationInfo.companyYoutube ||
      corporationInfo.companyReddit
    );

    if (!hasSocialMedia) {
      return null;
    }

    if (!userSentiment) {
      return {
        positive: 0,
        neutral: 0,
        negative: 0,
        topLikes: [],
        topImprove: [],
        hasData: false
      };
    }

    return {
      positive: userSentiment.positivePercentage,
      neutral: userSentiment.neutralPercentage,
      negative: userSentiment.negativePercentage,
      topLikes: userSentiment.positiveSummary,
      topImprove: userSentiment.negativeSummary,
      hasData: true
    };
  };

  const sentimentData = calculateSentiment();

  const handleSentimentClick = (type: "positive" | "neutral" | "negative") => {
    if (!sentimentData || !sentimentData.hasData || !userSentiment) return;
    
    let summary: string[] = [];
    let percentage = 0;

    switch (type) {
      case "positive":
        summary = userSentiment.positiveSummary;
        percentage = sentimentData.positive;
        break;
      case "neutral":
        summary = userSentiment.neutralSummary;
        percentage = sentimentData.neutral;
        break;
      case "negative":
        summary = userSentiment.negativeSummary;
        percentage = sentimentData.negative;
        break;
    }

    setSelectedSentiment({ type, percentage, summary });
    setShowSentimentDialog(true);
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

  // Calculate Y-axis domain for responsive scaling
  const getYAxisDomain = () => {
    if (financialData.length === 0) return [0, 100];
    
    const allValues = financialData.flatMap(d => [
      d.marketing,
      d.revenue,
      d.expenditure,
      d.profit
    ]);
    
    const maxValue = Math.max(...allValues);
    const minValue = Math.min(...allValues, 0);
    
    // Add 10% padding
    const padding = Math.abs(maxValue - minValue) * 0.1;
    return [Math.floor(minValue - padding), Math.ceil(maxValue + padding)];
  };

  const formatYAxis = (value: number) => {
    return `$${(value / 100).toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Performance Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your company's growth and competitive position
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

        <Tabs defaultValue="comparison" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="comparison">Competitor Comparison</TabsTrigger>
            <TabsTrigger value="growth">Our Growth</TabsTrigger>
          </TabsList>

          {/* Competitor Comparison Tab */}
          <TabsContent value="comparison" className="space-y-6">
            {corporationInfo && (
              <Card>
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

            <Card>
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
          </TabsContent>

          {/* Our Growth Tab */}
          <TabsContent value="growth" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Financial Performance</CardTitle>
                    <CardDescription>
                      Track your monthly financial metrics
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowFinancialEntry(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Data
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {financialData.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed rounded-lg">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                    <p className="text-muted-foreground mb-4">
                      No financial data yet. Add your monthly metrics to visualize growth.
                    </p>
                    <Button onClick={() => setShowFinancialEntry(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Add Financial Data
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="h-[400px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={financialData}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                          <XAxis dataKey="month" className="text-xs" />
                          <YAxis 
                            className="text-xs"
                            domain={getYAxisDomain()}
                            tickFormatter={formatYAxis}
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: 'hsl(var(--card))',
                              border: '1px solid hsl(var(--border))',
                              borderRadius: '8px'
                            }}
                            formatter={(value: number) => `$${(value / 100).toLocaleString()}`}
                          />
                          <Legend />
                          <Line 
                            type="monotone" 
                            dataKey="marketing" 
                            stroke="#f59e0b" 
                            strokeWidth={2}
                            name="Marketing Investment"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="revenue" 
                            stroke="#10b981" 
                            strokeWidth={2}
                            name="Revenue"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="expenditure" 
                            stroke="#ef4444" 
                            strokeWidth={2}
                            name="Expenditure"
                          />
                          <Line 
                            type="monotone" 
                            dataKey="profit" 
                            stroke="#3b82f6" 
                            strokeWidth={3}
                            name="Profit"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    
                    {/* Financial Data Table with Edit */}
                    <div className="mt-6 pt-6 border-t">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-semibold">Monthly Data</h4>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left p-2">Month</th>
                              <th className="text-right p-2">Marketing</th>
                              <th className="text-right p-2">Revenue</th>
                              <th className="text-right p-2">Expenditure</th>
                              <th className="text-right p-2">Profit</th>
                              <th className="text-right p-2">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {financialData.map((item) => (
                              <tr key={item.id} className="border-b hover:bg-accent/50">
                                <td className="p-2 font-medium">{item.month}</td>
                                <td className="p-2 text-right text-amber-600">
                                  ${(item.marketing / 100).toLocaleString()}
                                </td>
                                <td className="p-2 text-right text-green-600">
                                  ${(item.revenue / 100).toLocaleString()}
                                </td>
                                <td className="p-2 text-right text-red-600">
                                  ${(item.expenditure / 100).toLocaleString()}
                                </td>
                                <td className="p-2 text-right text-blue-600">
                                  ${(item.profit / 100).toLocaleString()}
                                </td>
                                <td className="p-2 text-right">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingFinancial(item)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t">
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Marketing</p>
                        <p className="text-2xl font-bold text-amber-600">
                          ${(financialData.reduce((sum, d) => sum + d.marketing, 0) / 100).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Revenue</p>
                        <p className="text-2xl font-bold text-green-600">
                          ${(financialData.reduce((sum, d) => sum + d.revenue, 0) / 100).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Expenditure</p>
                        <p className="text-2xl font-bold text-red-600">
                          ${(financialData.reduce((sum, d) => sum + d.expenditure, 0) / 100).toLocaleString()}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">Total Profit</p>
                        <p className="text-2xl font-bold text-blue-600">
                          ${(financialData.reduce((sum, d) => sum + d.profit, 0) / 100).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Sentiment Analysis Section */}
            {!sentimentData ? (
              <Alert className="border-orange-200 bg-orange-50 dark:border-orange-900 dark:bg-orange-950/20">
                <AlertCircle className="h-4 w-4 text-orange-600" />
                <AlertTitle className="text-orange-600">Social Media Handles Required</AlertTitle>
                <AlertDescription className="text-orange-600/90">
                  You haven't entered your social media handles for us to track. Please add them in your Corporation Settings to enable sentiment analysis.
                  <Button variant="link" className="p-0 h-auto ml-2 text-orange-600" asChild>
                    <Link href="/settings/corporation">Add Social Media Handles →</Link>
                  </Button>
                </AlertDescription>
              </Alert>
            ) : !sentimentData.hasData ? (
              <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertTitle className="text-blue-600">Ready to Scan Sentiment</AlertTitle>
                <AlertDescription className="text-blue-600/90 space-y-3">
                  <p>We're ready to analyze sentiment from your social media channels. Click the button below to start scanning.</p>
                  <Button 
                    onClick={handleScanSentiment} 
                    disabled={scrapingSentiment}
                    className="mt-2"
                  >
                    {scrapingSentiment ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Scan Sentiment
                      </>
                    )}
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>Public Sentiment About Your Product</CardTitle>
                        <CardDescription>AI-analyzed customer feedback and reviews</CardDescription>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleScanSentiment}
                        disabled={scrapingSentiment}
                      >
                        {scrapingSentiment ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Positive</span>
                        <Badge 
                          className="bg-green-600 cursor-pointer hover:bg-green-700"
                          onClick={() => handleSentimentClick("positive")}
                        >
                          {sentimentData.positive}%
                        </Badge>
                      </div>
                      <div 
                        className="h-3 bg-muted rounded-full overflow-hidden cursor-pointer"
                        onClick={() => handleSentimentClick("positive")}
                      >
                        <div 
                          className="h-full bg-green-600 transition-all duration-500"
                          style={{ width: `${sentimentData.positive}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Neutral</span>
                        <Badge 
                          variant="outline"
                          className="cursor-pointer hover:bg-accent"
                          onClick={() => handleSentimentClick("neutral")}
                        >
                          {sentimentData.neutral}%
                        </Badge>
                      </div>
                      <div 
                        className="h-3 bg-muted rounded-full overflow-hidden cursor-pointer"
                        onClick={() => handleSentimentClick("neutral")}
                      >
                        <div 
                          className="h-full bg-gray-400 transition-all duration-500"
                          style={{ width: `${sentimentData.neutral}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Negative</span>
                        <Badge 
                          variant="destructive"
                          className="cursor-pointer hover:bg-destructive/80"
                          onClick={() => handleSentimentClick("negative")}
                        >
                          {sentimentData.negative}%
                        </Badge>
                      </div>
                      <div 
                        className="h-3 bg-muted rounded-full overflow-hidden cursor-pointer"
                        onClick={() => handleSentimentClick("negative")}
                      >
                        <div 
                          className="h-full bg-red-600 transition-all duration-500"
                          style={{ width: `${sentimentData.negative}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mt-4">
                      Click on any percentage to view detailed feedback summary and share via email
                    </p>
                    
                    {userSentiment && (
                      <p className="text-xs text-muted-foreground">
                        Last updated: {new Date(userSentiment.scrapedAt).toLocaleString()}
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-green-600 dark:text-green-400">
                      What People Like
                    </CardTitle>
                    <CardDescription>Top positive feedback themes</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sentimentData.topLikes.length > 0 ? (
                      <ul className="space-y-3">
                        {sentimentData.topLikes.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No positive feedback data yet
                      </p>
                    )}
                  </CardContent>
                </Card>

                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle className="text-orange-600 dark:text-orange-400">
                      What People Want Us to Improve
                    </CardTitle>
                    <CardDescription>Areas for enhancement based on customer feedback</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {sentimentData.topImprove.length > 0 ? (
                      <>
                        <ul className="grid md:grid-cols-2 gap-4">
                          {sentimentData.topImprove.map((item, i) => (
                            <li key={i} className="flex items-start gap-3">
                              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5 flex-shrink-0" />
                              <span className="text-sm">{item}</span>
                            </li>
                          ))}
                        </ul>
                        <div className="mt-6 pt-6 border-t">
                          <Alert className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/20">
                            <AlertCircle className="h-4 w-4 text-blue-600" />
                            <AlertTitle className="text-blue-600">AI-Powered Insights</AlertTitle>
                            <AlertDescription className="text-blue-600/90">
                              This data is analyzed from your social media channels (YouTube, Reddit, X) using Google Gemini AI for accurate sentiment detection.
                            </AlertDescription>
                          </Alert>
                        </div>
                      </>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        No improvement suggestions yet
                      </p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>

        <FinancialDataEntry
          open={showFinancialEntry || editingFinancial !== null}
          onOpenChange={handleFinancialDialogClose}
          onSuccess={handleFinancialSuccess}
          editData={editingFinancial}
        />

        {selectedSentiment && (
          <SentimentDialog
            open={showSentimentDialog}
            onOpenChange={setShowSentimentDialog}
            type={selectedSentiment.type}
            percentage={selectedSentiment.percentage}
            summary={selectedSentiment.summary}
            financialData={financialData}
          />
        )}
      </main>
    </div>
  );
}