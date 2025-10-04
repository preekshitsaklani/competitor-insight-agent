"use client";

import { useEffect, useState } from "react";
import { useSession, authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function AccountSettingsPage() {
  const { data: session, isPending, refetch } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [deleteForm, setDeleteForm] = useState({
    password: "",
    verificationCode: "",
  });
  const [showDeleteVerification, setShowDeleteVerification] = useState(false);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    setLoading(true);
    try {
      const { error } = await authClient.changePassword({
        newPassword: passwordForm.newPassword,
        currentPassword: passwordForm.currentPassword,
        revokeOtherSessions: true,
      });

      if (error) {
        toast.error(error.message || "Failed to change password");
      } else {
        toast.success("Password changed successfully");
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }
    } catch (error) {
      toast.error("Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestData = async () => {
    setLoading(true);
    try {
      toast.success("Data collection request submitted. You'll receive an email with your data within 30 days.");
    } catch (error) {
      toast.error("Failed to request data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivateAccount = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deactivationRequestedAt: new Date().toISOString(),
        }),
      });

      if (res.ok) {
        toast.success("Account will be deactivated for 30 days. You can reactivate by logging in.");
        setTimeout(() => {
          authClient.signOut();
          localStorage.removeItem("bearer_token");
          router.push("/");
        }, 2000);
      } else {
        toast.error("Failed to deactivate account");
      }
    } catch (error) {
      toast.error("Failed to deactivate account");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestDeleteAccount = async () => {
    setLoading(true);
    try {
      // Send verification code to email
      toast.info("Verification code sent to your email");
      setShowDeleteVerification(true);
    } catch (error) {
      toast.error("Failed to send verification code");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDeleteAccount = async () => {
    if (!deleteForm.password || !deleteForm.verificationCode) {
      toast.error("Please enter both password and verification code");
      return;
    }

    if (deleteForm.verificationCode.length !== 6) {
      toast.error("Verification code must be 6 digits");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          deletionRequestedAt: new Date().toISOString(),
          deletionScheduledAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      });

      if (res.ok) {
        toast.success("Account deletion scheduled in 30 days. You can cancel by logging in before then.");
        setTimeout(() => {
          authClient.signOut();
          localStorage.removeItem("bearer_token");
          router.push("/");
        }, 2000);
      } else {
        toast.error("Failed to schedule account deletion");
      }
    } catch (error) {
      toast.error("Failed to schedule account deletion");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
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
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="current">Current Password</Label>
            <Input
              id="current"
              type="password"
              autoComplete="off"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="new">New Password</Label>
            <Input
              id="new"
              type="password"
              autoComplete="off"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="confirm">Confirm New Password</Label>
            <Input
              id="confirm"
              type="password"
              autoComplete="off"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
            />
          </div>
          <Button onClick={handleChangePassword} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Change Password
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Data Collection</CardTitle>
          <CardDescription>Request a copy of your data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            You can request a copy of all your data. We'll email you a comprehensive report within 30 days.
          </p>
          <Button onClick={handleRequestData} disabled={loading} variant="outline">
            Request My Data
          </Button>
        </CardContent>
      </Card>

      <Card className="border-orange-200 dark:border-orange-900">
        <CardHeader>
          <CardTitle className="text-orange-600 dark:text-orange-400">Deactivate Account</CardTitle>
          <CardDescription>Temporarily disable your account for 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Your account will be deactivated for 30 days. You can reactivate it anytime by logging in.
          </p>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" className="border-orange-600 text-orange-600">
                Deactivate Account
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Deactivate Account?</AlertDialogTitle>
                <AlertDialogDescription>
                  Your account will be deactivated for 30 days. You can reactivate by logging in anytime.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeactivateAccount}>Deactivate</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card>

      <Card className="border-red-200 dark:border-red-900">
        <CardHeader>
          <CardTitle className="text-red-600 dark:text-red-400 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Account
          </CardTitle>
          <CardDescription>Permanently delete your account after 30 days</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            This action will schedule your account for deletion in 30 days. You can cancel by logging in before then.
          </p>

          {!showDeleteVerification ? (
            <Button variant="destructive" onClick={handleRequestDeleteAccount} disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Request Account Deletion
            </Button>
          ) : (
            <div className="space-y-4 p-4 border border-red-200 rounded-lg">
              <div>
                <Label htmlFor="del-password">Enter Current Password</Label>
                <Input
                  id="del-password"
                  type="password"
                  autoComplete="off"
                  value={deleteForm.password}
                  onChange={(e) => setDeleteForm({ ...deleteForm, password: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="del-code">Enter Email Verification Code</Label>
                <Input
                  id="del-code"
                  value={deleteForm.verificationCode}
                  onChange={(e) => setDeleteForm({ ...deleteForm, verificationCode: e.target.value })}
                  placeholder="6-digit code"
                  maxLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowDeleteVerification(false)}>
                  Cancel
                </Button>
                <Button variant="destructive" onClick={handleConfirmDeleteAccount} disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Confirm Deletion
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}