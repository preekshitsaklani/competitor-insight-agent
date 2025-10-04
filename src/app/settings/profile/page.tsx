"use client";

import { useEffect, useState } from "react";
import { useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

export default function ProfileSettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    name: "",
    email: "",
    phone: "",
    companyWebsite: "",
    profilePhotoUrl: "",
  });
  const [notifications, setNotifications] = useState({
    emailEnabled: false,
    emailFrequency: "daily",
    emailTime: "09:00",
    slackEnabled: false,
    slackWebhookUrl: "",
  });
  const [phoneOtp, setPhoneOtp] = useState("");
  const [showPhoneOtp, setShowPhoneOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [pendingPhone, setPendingPhone] = useState("");

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  useEffect(() => {
    if (session?.user) {
      fetchProfile();
    }
  }, [session]);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setProfile({
          name: data.name || "",
          email: data.email || "",
          phone: data.phone || "",
          companyWebsite: data.companyWebsite || "",
          profilePhotoUrl: data.profilePhotoUrl || "",
        });
      }

      const settingsRes = await fetch(`/api/user-settings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (settingsRes.ok) {
        const settings = await settingsRes.json();
        if (settings.length > 0) {
          const userSettings = settings[0];
          setNotifications({
            emailEnabled: userSettings.emailNotifications || false,
            emailFrequency: userSettings.notificationFrequency || "daily",
            emailTime: userSettings.notificationTime || "09:00",
            slackEnabled: userSettings.slackNotifications || false,
            slackWebhookUrl: userSettings.slackWebhookUrl || "",
          });
        }
      }
    } catch (error) {
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/users`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: profile.name,
          phone: profile.phone,
          companyWebsite: profile.companyWebsite,
          profilePhotoUrl: profile.profilePhotoUrl,
        }),
      });

      if (res.ok) {
        toast.success("Profile updated successfully");
      } else {
        toast.error("Failed to update profile");
      }
    } catch (error) {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch(`/api/user-settings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emailNotifications: notifications.emailEnabled,
          notificationFrequency: notifications.emailFrequency,
          notificationTime: notifications.emailTime,
          slackNotifications: notifications.slackEnabled,
          slackWebhookUrl: notifications.slackWebhookUrl,
        }),
      });

      if (res.ok) {
        toast.success("Notification settings updated");
      } else {
        toast.error("Failed to update settings");
      }
    } catch (error) {
      toast.error("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  const handlePhoneChange = async (newPhone: string) => {
    if (newPhone && newPhone !== profile.phone && newPhone.length >= 10) {
      setPendingPhone(newPhone);
      setShowPhoneOtp(true);
      
      // Send OTP via email
      try {
        const token = localStorage.getItem("bearer_token");
        const res = await fetch("/api/send-otp", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ phone: newPhone }),
        });

        if (res.ok) {
          setOtpSent(true);
          toast.success("Verification code sent to your email");
        } else {
          const data = await res.json();
          toast.error(data.error || "Failed to send verification code");
          setShowPhoneOtp(false);
        }
      } catch (error) {
        toast.error("Failed to send verification code");
        setShowPhoneOtp(false);
      }
    } else {
      setProfile({ ...profile, phone: newPhone });
    }
  };

  const verifyPhoneOtp = async () => {
    if (phoneOtp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    try {
      const token = localStorage.getItem("bearer_token");
      const res = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          phone: pendingPhone,
          otp: phoneOtp,
          verify: true 
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.verified) {
          // Update profile with verified phone
          setProfile({ ...profile, phone: pendingPhone });
          toast.success("Phone verified successfully");
          setShowPhoneOtp(false);
          setPhoneOtp("");
          setOtpSent(false);
          setPendingPhone("");
          
          // Save to backend
          await handleSaveProfile();
        } else {
          toast.error("Invalid verification code");
        }
      } else {
        toast.error("Failed to verify code");
      }
    } catch (error) {
      toast.error("Failed to verify code");
    }
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
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center overflow-hidden">
              {profile.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <Upload className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div>
              <Label htmlFor="photo">Profile Photo URL</Label>
              <Input
                id="photo"
                value={profile.profilePhotoUrl}
                onChange={(e) => setProfile({ ...profile, profilePhotoUrl: e.target.value })}
                placeholder="https://example.com/photo.jpg"
              />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="email">Email (read-only)</Label>
              <Input id="email" value={profile.email} disabled />
            </div>
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              value={showPhoneOtp ? pendingPhone : profile.phone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="+1234567890"
              disabled={showPhoneOtp}
            />
            {showPhoneOtp && (
              <div className="mt-2 space-y-2">
                <p className="text-sm text-muted-foreground">
                  A verification code has been sent to your email
                </p>
                <div className="flex gap-2">
                  <Input
                    value={phoneOtp}
                    onChange={(e) => setPhoneOtp(e.target.value.replace(/\D/g, ""))}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                  />
                  <Button onClick={verifyPhoneOtp} disabled={!otpSent}>
                    Verify
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setShowPhoneOtp(false);
                      setPhoneOtp("");
                      setOtpSent(false);
                      setPendingPhone("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="website">Company Website</Label>
            <Input
              id="website"
              value={profile.companyWebsite}
              onChange={(e) => setProfile({ ...profile, companyWebsite: e.target.value })}
              placeholder="https://company.com"
            />
          </div>

          <Button onClick={handleSaveProfile} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
          <CardDescription>Configure how you receive insights</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="email-notif">Email Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive insights via email</p>
            </div>
            <Button
              variant={notifications.emailEnabled ? "default" : "outline"}
              onClick={() => setNotifications({ ...notifications, emailEnabled: !notifications.emailEnabled })}
            >
              {notifications.emailEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {notifications.emailEnabled && (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Frequency</Label>
                <Select
                  value={notifications.emailFrequency}
                  onValueChange={(value) => setNotifications({ ...notifications, emailFrequency: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Time</Label>
                <Input
                  type="time"
                  value={notifications.emailTime}
                  onChange={(e) => setNotifications({ ...notifications, emailTime: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="slack-notif">Slack Notifications</Label>
              <p className="text-sm text-muted-foreground">Receive insights via Slack</p>
            </div>
            <Button
              variant={notifications.slackEnabled ? "default" : "outline"}
              onClick={() => setNotifications({ ...notifications, slackEnabled: !notifications.slackEnabled })}
            >
              {notifications.slackEnabled ? "Enabled" : "Disabled"}
            </Button>
          </div>

          {notifications.slackEnabled && (
            <div>
              <Label>Slack Webhook URL</Label>
              <Input
                value={notifications.slackWebhookUrl}
                onChange={(e) => setNotifications({ ...notifications, slackWebhookUrl: e.target.value })}
                placeholder="https://hooks.slack.com/services/..."
              />
            </div>
          )}

          <Button onClick={handleSaveNotifications} disabled={saving}>
            {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Notifications
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}