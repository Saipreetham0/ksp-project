import type { Metadata } from "next";
import Link from "next/link";
import { AuthLayout } from "@/components/auth/AuthLayout";
import ProfessionalAuthForm from "@/components/auth/ProfessionalAuthForm";

export const metadata: Metadata = {
  title: "Create your account",
  description: "Create a KSP Projects account to order and track your academic project.",
};

export default function SignupPage() {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Continue with Google or get a magic link by email — no password to remember."
      footer={
        <>
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <ProfessionalAuthForm />
    </AuthLayout>
  );
}
