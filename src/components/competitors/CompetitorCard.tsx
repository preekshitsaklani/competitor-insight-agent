"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { MoreVertical, ExternalLink, Trash2, Pause, Play } from "lucide-react";
import { toast } from "sonner";

interface Competitor {
  id: number;
  name: string;
  websiteUrl?: string;
  logoUrl?: string;
  industry?: string;
  status: string;
  monitoringFrequency: string;
}

export function CompetitorCard({
  competitor,
  onUpdate,
}: {
  competitor: Competitor;
  onUpdate: () => void;
}) {
  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${competitor.name}?`)) return;

    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/competitors/${competitor.id}?id=${competitor.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        toast.success("Competitor deleted successfully");
        onUpdate();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Failed to delete competitor");
    }
  };

  const handleToggleStatus = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const newStatus = competitor.status === "active" ? "paused" : "active";
      
      const res = await fetch(`/api/competitors/${competitor.id}?id=${competitor.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        toast.success(`Monitoring ${newStatus === "active" ? "resumed" : "paused"}`);
        onUpdate();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Failed to update status");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-3">
        <div className="flex items-start space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            {competitor.logoUrl ? (
              <img
                src={competitor.logoUrl}
                alt={competitor.name}
                className="w-8 h-8 rounded"
              />
            ) : (
              <span className="text-primary font-bold">
                {competitor.name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold">{competitor.name}</h3>
            {competitor.industry && (
              <p className="text-sm text-muted-foreground">{competitor.industry}</p>
            )}
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleToggleStatus}>
              {competitor.status === "active" ? (
                <>
                  <Pause className="mr-2 h-4 w-4" />
                  Pause Monitoring
                </>
              ) : (
                <>
                  <Play className="mr-2 h-4 w-4" />
                  Resume Monitoring
                </>
              )}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete} className="text-red-600">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant={competitor.status === "active" ? "default" : "secondary"}>
            {competitor.status}
          </Badge>
          <Badge variant="outline">{competitor.monitoringFrequency}</Badge>
        </div>

        {competitor.websiteUrl && (
          <Button
            variant="outline"
            size="sm"
            className="w-full"
            asChild
          >
            <a
              href={competitor.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Visit Website
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}