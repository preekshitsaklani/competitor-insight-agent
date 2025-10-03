import { AIInsightsDemo } from "@/components/ai/AIInsightsDemo"
import { DashboardHeader } from "@/components/dashboard/DashboardHeader"
import { Navigation } from "@/components/dashboard/Navigation"

export default function AIDemoPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <Navigation />
      <AIInsightsDemo />
    </div>
  )
}