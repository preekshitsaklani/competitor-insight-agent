"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Employee {
  name: string;
  role: string;
  currentWork: string;
  futurePlans: string;
}

export default function CorporationSettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [corporationInfo, setCorporationInfo] = useState({
    companySize: 0,
    companyDescription: "",
    industry: "",
    topEmployees: [] as Employee[],
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchCorporationInfo();
    }
  }, [session]);

  const fetchCorporationInfo = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/corporation-info`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.length > 0) {
          const info = data[0];
          setCorporationInfo({
            companySize: info.companySize || 0,
            companyDescription: info.companyDescription || "",
            industry: info.industry || "",
            topEmployees: info.topEmployees || [],
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load corporation info");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/corporation-info`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(corporationInfo),
      });

      if (res.ok) {
        toast.success("Corporation info saved successfully");
      } else {
        toast.error("Failed to save corporation info");
      }
    } catch (error) {
      toast.error("Failed to save corporation info");
    } finally {
      setSaving(false);
    }
  };

  const addEmployee = () => {
    if (corporationInfo.topEmployees.length < 5) {
      setCorporationInfo({
        ...corporationInfo,
        topEmployees: [
          ...corporationInfo.topEmployees,
          { name: "", role: "", currentWork: "", futurePlans: "" },
        ],
      });
    } else {
      toast.error("Maximum 5 employees allowed");
    }
  };

  const updateEmployee = (index: number, field: keyof Employee, value: string) => {
    const updated = [...corporationInfo.topEmployees];
    updated[index] = { ...updated[index], [field]: value };
    setCorporationInfo({ ...corporationInfo, topEmployees: updated });
  };

  const removeEmployee = (index: number) => {
    const updated = corporationInfo.topEmployees.filter((_, i) => i !== index);
    setCorporationInfo({ ...corporationInfo, topEmployees: updated });
  };

  if (isPending || loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>Details about your organization</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="size">Company Size</Label>
              <Input
                id="size"
                type="number"
                value={corporationInfo.companySize}
                onChange={(e) =>
                  setCorporationInfo({ ...corporationInfo, companySize: parseInt(e.target.value) || 0 })
                }
                placeholder="Number of employees"
              />
            </div>
            <div>
              <Label htmlFor="industry">Industry</Label>
              <Input
                id="industry"
                value={corporationInfo.industry}
                onChange={(e) => setCorporationInfo({ ...corporationInfo, industry: e.target.value })}
                placeholder="e.g., Technology, Healthcare"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Company Description</Label>
            <Textarea
              id="description"
              value={corporationInfo.companyDescription}
              onChange={(e) => setCorporationInfo({ ...corporationInfo, companyDescription: e.target.value })}
              placeholder="What does your company do?"
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top 5 Key Employees</CardTitle>
              <CardDescription>Track important team members and their work</CardDescription>
            </div>
            <Button onClick={addEmployee} disabled={corporationInfo.topEmployees.length >= 5} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Employee
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {corporationInfo.topEmployees.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No employees added yet</p>
          ) : (
            corporationInfo.topEmployees.map((employee, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Employee {index + 1}</h4>
                  <Button variant="ghost" size="sm" onClick={() => removeEmployee(index)}>
                    <Trash2 className="h-4 w-4 text-red-600" />
                  </Button>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <Label>Name</Label>
                    <Input
                      value={employee.name}
                      onChange={(e) => updateEmployee(index, "name", e.target.value)}
                      placeholder="Employee name"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Input
                      value={employee.role}
                      onChange={(e) => updateEmployee(index, "role", e.target.value)}
                      placeholder="Job title"
                    />
                  </div>
                </div>

                <div>
                  <Label>Current Work</Label>
                  <Textarea
                    value={employee.currentWork}
                    onChange={(e) => updateEmployee(index, "currentWork", e.target.value)}
                    placeholder="What they're currently working on"
                    rows={2}
                  />
                </div>

                <div>
                  <Label>Future Plans</Label>
                  <Textarea
                    value={employee.futurePlans}
                    onChange={(e) => updateEmployee(index, "futurePlans", e.target.value)}
                    placeholder="Their upcoming projects and goals"
                    rows={2}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Save Corporation Info
      </Button>
    </div>
  );
}