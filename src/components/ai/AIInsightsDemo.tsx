"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Loader2, Sparkles, TrendingUp, AlertCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function AIInsightsDemo() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)

  // Generate Insight
  const [insightData, setInsightData] = useState({
    competitorName: "Acme Corp",
    platform: "Website",
    content: "We're excited to announce our new AI-powered analytics dashboard with real-time insights, predictive modeling, and automated reporting. Available now for all Enterprise customers at $299/month.",
    url: "https://acmecorp.com/blog/new-analytics"
  })

  const handleGenerateInsight = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/ai/generate-insight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(insightData)
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to generate insight" })
    } finally {
      setLoading(false)
    }
  }

  // Detect Changes
  const [changeData, setChangeData] = useState({
    competitorName: "Acme Corp",
    oldContent: "Basic analytics dashboard. Track your key metrics. Starting at $199/month.",
    newContent: "AI-powered analytics dashboard with real-time insights, predictive modeling, and automated reporting. Enterprise plans starting at $299/month."
  })

  const handleDetectChanges = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/ai/detect-changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changeData)
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to detect changes" })
    } finally {
      setLoading(false)
    }
  }

  // Analyze Sentiment
  const [sentimentData, setSentimentData] = useState({
    content: "We're disrupting the market with breakthrough technology that makes our competitors' solutions obsolete. Join the revolution now!",
    context: "Product launch announcement"
  })

  const handleAnalyzeSentiment = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch("/api/ai/analyze-sentiment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sentimentData)
      })
      const data = await res.json()
      setResult(data)
    } catch (error) {
      setResult({ error: "Failed to analyze sentiment" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">AI-Powered Competitive Intelligence</h1>
        </div>
        <p className="text-muted-foreground">
          Powered by Google Gemini Pro - Test the AI capabilities
        </p>
      </div>

      <Tabs defaultValue="insight" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="insight">Generate Insight</TabsTrigger>
          <TabsTrigger value="changes">Detect Changes</TabsTrigger>
          <TabsTrigger value="sentiment">Analyze Sentiment</TabsTrigger>
        </TabsList>

        <TabsContent value="insight" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Competitive Insight</CardTitle>
              <CardDescription>
                Analyze competitor content and generate actionable intelligence
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="competitor">Competitor Name</Label>
                <Input
                  id="competitor"
                  value={insightData.competitorName}
                  onChange={(e) => setInsightData({ ...insightData, competitorName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="platform">Platform</Label>
                <Input
                  id="platform"
                  value={insightData.platform}
                  onChange={(e) => setInsightData({ ...insightData, platform: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content to Analyze</Label>
                <Textarea
                  id="content"
                  rows={6}
                  value={insightData.content}
                  onChange={(e) => setInsightData({ ...insightData, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL (Optional)</Label>
                <Input
                  id="url"
                  value={insightData.url}
                  onChange={(e) => setInsightData({ ...insightData, url: e.target.value })}
                />
              </div>
              <Button onClick={handleGenerateInsight} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with Gemini Pro...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Insight
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Detect Content Changes</CardTitle>
              <CardDescription>
                Compare two versions and identify significant changes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="changeCompetitor">Competitor Name</Label>
                <Input
                  id="changeCompetitor"
                  value={changeData.competitorName}
                  onChange={(e) => setChangeData({ ...changeData, competitorName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oldContent">Old Content</Label>
                <Textarea
                  id="oldContent"
                  rows={4}
                  value={changeData.oldContent}
                  onChange={(e) => setChangeData({ ...changeData, oldContent: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newContent">New Content</Label>
                <Textarea
                  id="newContent"
                  rows={4}
                  value={changeData.newContent}
                  onChange={(e) => setChangeData({ ...changeData, newContent: e.target.value })}
                />
              </div>
              <Button onClick={handleDetectChanges} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Detecting Changes...
                  </>
                ) : (
                  <>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Detect Changes
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sentiment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Analyze Sentiment</CardTitle>
              <CardDescription>
                Understand the tone and competitive stance of content
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="sentimentContent">Content</Label>
                <Textarea
                  id="sentimentContent"
                  rows={4}
                  value={sentimentData.content}
                  onChange={(e) => setSentimentData({ ...sentimentData, content: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="context">Context</Label>
                <Input
                  id="context"
                  value={sentimentData.context}
                  onChange={(e) => setSentimentData({ ...sentimentData, context: e.target.value })}
                />
              </div>
              <Button onClick={handleAnalyzeSentiment} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing Sentiment...
                  </>
                ) : (
                  <>
                    <AlertCircle className="mr-2 h-4 w-4" />
                    Analyze Sentiment
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {result && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              AI Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <div className="text-red-500 p-4 bg-red-50 dark:bg-red-950 rounded-lg">
                <p className="font-semibold">Error:</p>
                <p>{result.error}</p>
                {result.details && <p className="text-sm mt-2">{result.details}</p>}
              </div>
            ) : (
              <div className="space-y-4">
                {result.insight && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Summary</h4>
                      <p className="text-sm text-muted-foreground">{result.insight.summary}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={result.insight.sentiment === "Threat" ? "destructive" : "default"}>
                        {result.insight.sentiment}
                      </Badge>
                      <Badge variant="outline">{result.insight.type}</Badge>
                      <Badge variant="secondary">{result.insight.priority} Priority</Badge>
                    </div>
                    {result.insight.keyPoints && (
                      <div>
                        <h4 className="font-semibold mb-2">Key Points</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.insight.keyPoints.map((point: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">{point}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {result.insight.recommendations && (
                      <div>
                        <h4 className="font-semibold mb-2">Recommendations</h4>
                        <ul className="list-disc list-inside space-y-1">
                          {result.insight.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm text-muted-foreground">{rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
                {result.analysis && (
                  <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                    {JSON.stringify(result.analysis, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}