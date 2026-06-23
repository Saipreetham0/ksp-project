import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import ProfessionalAuthForm from "@/components/auth/ProfessionalAuthForm";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to KSP Projects to place and track your academic project orders.",
};

export default function LoginPage() {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue. New here? Google or a magic link creates your account automatically."
      footer={
        <>
          New to KSP Projects?{" "}
          <Link href="/signup" className="font-medium text-primary underline-offset-4 hover:underline">
            Create an account
          </Link>
        </>
      }
    >
      <ProfessionalAuthForm />
    </AuthLayout>
  );
}
