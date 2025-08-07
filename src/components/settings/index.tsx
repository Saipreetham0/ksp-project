"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
// import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   AlertDialog,
//   AlertDialogAction,
//   AlertDialogCancel,
//   AlertDialogContent,
//   AlertDialogDescription,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogTitle,
//   AlertDialogTrigger,
// } from "@/components/ui/alert-dialog";
// Firebase imports removed - replaced with Supabase
// import { auth, db } from "@/lib/firebase";
// import { doc, updateDoc } from "firebase/firestore";
import { supabase } from "@/lib/supabase";
import { Loader2,  Bell,
    // Mail, Shield, Trash2
} from "lucide-react";
// import { toast } from "@/components/ui/toast";

import { useToast } from "@/hooks/use-toast";
// import { ToastAction } from "@/components/ui/toast";

interface SettingsProps {
  initialSettings?: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    securityAlerts: boolean;
    twoFactorAuth: boolean;
    language: string;
    timezone: string;
  };
}

export default function SettingsPage({ initialSettings }: SettingsProps) {
//   const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: initialSettings?.emailNotifications ?? true,
    marketingEmails: initialSettings?.marketingEmails ?? false,
    securityAlerts: initialSettings?.securityAlerts ?? true,
    twoFactorAuth: initialSettings?.twoFactorAuth ?? false,
    language: initialSettings?.language ?? "en",
    timezone:
      initialSettings?.timezone ??
      Intl.DateTimeFormat().resolvedOptions().timeZone,
  });
  const { toast } = useToast();
  const handleSaveSettings = async () => {
    // Get current user from Supabase
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSaving(true);
    try {
      // Update settings in Supabase profiles table
      const { error } = await supabase
        .from('profiles')
        .update({
          settings: settings,
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: "Settings saved successfully",
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast({
        variant: "destructive",
        title: "Failed to save settings",
      });
    } finally {
      setSaving(false);
    }
  };

  //   const handleDeleteAccount = async () => {
  //     if (!auth.currentUser) return;

  //     try {
  //       // Add your account deletion logic here
  //       await auth.currentUser.delete();
  //       router.push("/");
  //       toast.success("Account deleted successfully");
  //     } catch (error) {
  //       console.error("Error deleting account:", error);
  //       toast.error("Failed to delete account");
  //     }
  //   };

  return (
    <div className="container mx-auto p-6 max-w-3xl space-y-6">
      {/* Notifications Settings */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <CardDescription>
            Manage how you receive notifications and updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Email Notifications</Label>
              <p className="text-sm text-gray-500">
                Receive notifications about your account activity
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({
                  ...prev,
                  emailNotifications: checked,
                }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="marketing">Marketing Emails</Label>
              <p className="text-sm text-gray-500">
                Receive emails about new features and updates
              </p>
            </div>
            <Switch
              id="marketing"
              checked={settings.marketingEmails}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, marketingEmails: checked }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      {/* <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Security</CardTitle>
          </div>
          <CardDescription>
            Manage your account security preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="security-alerts">Security Alerts</Label>
              <p className="text-sm text-gray-500">
                Get notified about important security updates
              </p>
            </div>
            <Switch
              id="security-alerts"
              checked={settings.securityAlerts}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, securityAlerts: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="2fa">Two-Factor Authentication</Label>
              <p className="text-sm text-gray-500">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="2fa"
              checked={settings.twoFactorAuth}
              onCheckedChange={(checked) =>
                setSettings((prev) => ({ ...prev, twoFactorAuth: checked }))
              }
            />
          </div>
        </CardContent>
      </Card> */}

      {/* Preferences */}
      {/* <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your account preferences</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="language">Language</Label>
              <Select
                value={settings.language}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger id="language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                  <SelectItem value="de">German</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={settings.timezone}
                onValueChange={(value) =>
                  setSettings((prev) => ({ ...prev, timezone: value }))
                }
              >
                <SelectTrigger id="timezone">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="UTC">UTC</SelectItem>
                  <SelectItem value="America/New_York">Eastern Time</SelectItem>
                  <SelectItem value="America/Chicago">Central Time</SelectItem>
                  <SelectItem value="America/Los_Angeles">
                    Pacific Time
                  </SelectItem>
                  <SelectItem value="Asia/Tokyo">Japan Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card> */}

      {/* Danger Zone */}
      {/* <Card className="border-red-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-red-500" />
            <CardTitle className="text-red-500">Danger Zone</CardTitle>
          </div>
          <CardDescription>
            Permanent actions that cannot be undone
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your account and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                //   onClick={handleDeleteAccount}
                  className="bg-red-500 hover:bg-red-600"
                >
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </CardContent>
      </Card> */}

      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="min-w-[100px]"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>
    </div>
  );
}
