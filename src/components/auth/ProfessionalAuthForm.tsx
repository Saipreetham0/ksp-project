"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";
import { createClient } from "@/utils/supabase/client";
import { getErrorMessage } from "@/lib/utils";
import { Mail, Loader2, MailCheck, AlertCircle, ArrowLeft } from "lucide-react";

const emailSchema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type EmailFormData = z.infer<typeof emailSchema>;

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z" />
      <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z" />
    </svg>
  );
}

interface ProfessionalAuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function ProfessionalAuthForm({
  redirectTo = "/dashboard",
}: ProfessionalAuthFormProps) {
  const [isLoading, setIsLoading] = useState<"google" | "magic" | null>(null);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();
  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: "" },
  });

  const callbackUrl = (origin: string) =>
    `${origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;

  const handleMagicLink = async (data: EmailFormData) => {
    setIsLoading("magic");
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: { emailRedirectTo: callbackUrl(window.location.origin) },
      });
      if (error) throw error;
      setMagicLinkSent(true);
      toast({ title: "Check your email", description: `Sign-in link sent to ${data.email}.` });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(null);
    }
  };

  const handleGoogle = async () => {
    setIsLoading("google");
    setError(null);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callbackUrl(window.location.origin) },
      });
      if (error) throw error;
    } catch (err) {
      setError(getErrorMessage(err));
      setIsLoading(null);
    }
  };

  if (magicLinkSent) {
    return (
      <div className="space-y-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success/10 text-success">
          <MailCheck className="h-6 w-6" />
        </span>
        <div className="space-y-1">
          <h2 className="text-lg font-semibold tracking-tight">Check your email</h2>
          <p className="text-sm text-muted-foreground">
            We sent a sign-in link to{" "}
            <span className="font-medium text-foreground">{form.getValues("email")}</span>.
            It expires in 1 hour.
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-muted-foreground"
          onClick={() => {
            setMagicLinkSent(false);
            setError(null);
            form.reset();
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to sign in
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button
        variant="outline"
        className="h-11 w-full"
        onClick={handleGoogle}
        disabled={!!isLoading}
      >
        {isLoading === "google" ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <span className="mr-2">
            <GoogleIcon />
          </span>
        )}
        Continue with Google
      </Button>

      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleMagicLink)} className="space-y-3">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email address</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    className="h-11"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="h-11 w-full" disabled={!!isLoading}>
            {isLoading === "magic" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Mail className="mr-2 h-4 w-4" />
            )}
            Email me a sign-in link
          </Button>
        </form>
      </Form>

      <p className="text-center text-xs leading-relaxed text-muted-foreground">
        By continuing you agree to our{" "}
        <a href="/terms" className="underline underline-offset-2 hover:text-foreground">Terms</a>{" "}
        and{" "}
        <a href="/privacy" className="underline underline-offset-2 hover:text-foreground">Privacy Policy</a>.
      </p>
    </div>
  );
}
