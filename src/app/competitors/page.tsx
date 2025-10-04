"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Sparkles } from "lucide-react";
import { AddCompetitorDialog } from "@/components/competitors/AddCompetitorDialog";
import { AIDiscoveryDialog } from "@/components/competitors/AIDiscoveryDialog";
import { CompetitorCard } from "@/components/competitors/CompetitorCard";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Competitor {
  id: number;
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  industry?: string;
  status: string;
  monitoringFrequency: string;
}

export default function CompetitorsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAIDialogOpen, setIsAIDialogOpen] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCompetitors();
    }
  }, [session]);

  const fetchCompetitors = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/competitors", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setCompetitors(data);
      }
    } catch (error) {
      toast.error("Failed to load competitors");
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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Competitors</h1>
            <p className="text-muted-foreground mt-1">
              Manage and monitor your competitive landscape
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsAIDialogOpen(true)}>
              <Sparkles className="mr-2 h-4 w-4" />
              AI Discovery
            </Button>
            <Button onClick={() => setIsDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Manually
            </Button>
          </div>
        </div>

        {competitors.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed rounded-lg">
            <Sparkles className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-6">
              No competitors added yet. Start tracking your first competitor.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => setIsAIDialogOpen(true)} variant="outline">
                <Sparkles className="mr-2 h-4 w-4" />
                Discover with AI
              </Button>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Manually
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {competitors.map((competitor) => (
              <CompetitorCard
                key={competitor.id}
                competitor={competitor}
                onUpdate={fetchCompetitors}
              />
            ))}
          </div>
        )}

        <AddCompetitorDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          onSuccess={fetchCompetitors}
        />
        
        <AIDiscoveryDialog
          open={isAIDialogOpen}
          onOpenChange={setIsAIDialogOpen}
          onSuccess={fetchCompetitors}
        />
      </main>
    </div>
  );
}