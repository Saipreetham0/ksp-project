import { Metadata } from "next";

import SettingsPage from "@/components/settings";

export const metadata: Metadata = {
  title: "Settings - KSP Projects",
  description: "Student project management dashboard",
};

export default function DashboardPage() {
  return (
    <SettingsPage
      initialSettings={{
        emailNotifications: true,
        marketingEmails: false,
        securityAlerts: true,
        twoFactorAuth: false,
        language: "en",
        timezone: "UTC",
      }}
    />
  );
}
