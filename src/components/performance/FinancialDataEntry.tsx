import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface FinancialDataEntryProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editData?: {
    id: number;
    fullMonth: string;
    marketing: number;
    revenue: number;
    expenditure: number;
    profit: number;
  } | null;
}

export function FinancialDataEntry({ open, onOpenChange, onSuccess, editData }: FinancialDataEntryProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    month: new Date().toISOString().slice(0, 7), // YYYY-MM
    expenses: "",
    marketing: "",
    totalRevenue: "",
    profit: "",
  });

  // Populate form when editing
  useEffect(() => {
    if (editData) {
      setFormData({
        month: editData.fullMonth,
        expenses: (editData.expenditure / 100).toString(),
        marketing: (editData.marketing / 100).toString(),
        totalRevenue: (editData.revenue / 100).toString(),
        profit: (editData.profit / 100).toString(),
      });
    } else {
      setFormData({
        month: new Date().toISOString().slice(0, 7),
        expenses: "",
        marketing: "",
        totalRevenue: "",
        profit: "",
      });
    }
  }, [editData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("bearer_token");
      const url = editData 
        ? `/api/financial-metrics/${editData.id}`
        : "/api/financial-metrics";
      
      const method = editData ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          month: formData.month,
          expenses: parseInt(formData.expenses) * 100, // Convert to cents
          marketing: parseInt(formData.marketing) * 100,
          totalRevenue: parseInt(formData.totalRevenue) * 100,
          profit: parseInt(formData.profit) * 100,
        }),
      });

      if (res.ok) {
        toast.success(editData ? "Financial data updated successfully" : "Financial data added successfully");
        onSuccess();
        onOpenChange(false);
        setFormData({
          month: new Date().toISOString().slice(0, 7),
          expenses: "",
          marketing: "",
          totalRevenue: "",
          profit: "",
        });
      } else {
        const error = await res.json();
        toast.error(error.error || `Failed to ${editData ? "update" : "add"} financial data`);
      }
    } catch (error) {
      toast.error(`Failed to ${editData ? "update" : "add"} financial data`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{editData ? "Edit" : "Add"} Financial Data</DialogTitle>
          <DialogDescription>
            {editData ? "Update" : "Enter"} your company's financial metrics for a specific month
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="month">Month</Label>
            <Input
              id="month"
              type="month"
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expenses">Expenses ($)</Label>
              <Input
                id="expenses"
                type="number"
                placeholder="0"
                value={formData.expenses}
                onChange={(e) => setFormData({ ...formData, expenses: e.target.value })}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="marketing">Marketing ($)</Label>
              <Input
                id="marketing"
                type="number"
                placeholder="0"
                value={formData.marketing}
                onChange={(e) => setFormData({ ...formData, marketing: e.target.value })}
                required
                min="0"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="revenue">Total Revenue ($)</Label>
              <Input
                id="revenue"
                type="number"
                placeholder="0"
                value={formData.totalRevenue}
                onChange={(e) => setFormData({ ...formData, totalRevenue: e.target.value })}
                required
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="profit">Profit ($)</Label>
              <Input
                id="profit"
                type="number"
                placeholder="0"
                value={formData.profit}
                onChange={(e) => setFormData({ ...formData, profit: e.target.value })}
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editData ? "Update" : "Add"} Data
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}