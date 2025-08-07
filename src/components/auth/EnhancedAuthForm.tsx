"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { createClient } from '@/utils/supabase/client';
import {
  Mail,
  Loader2,
  CheckCircle,
  AlertCircle,
  Chrome,
  Sparkles,
  Zap
} from 'lucide-react';
import Image from 'next/image';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface EnhancedAuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function EnhancedAuthForm({
  onSuccess,
  redirectTo = '/dashboard'
}: EnhancedAuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [authMode, setAuthMode] = useState<'google' | 'magic'>('google');
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  const form = useForm<EmailFormData>({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const handleMagicLinkSignIn = async (data: EmailFormData) => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;

      setMagicLinkSent(true);
      toast({
        title: 'Magic Link Sent! ✨',
        description: `Check your email at ${data.email} for the sign-in link.`,
      });
    } catch (error: any) {
      setError(error.message || 'Failed to send magic link');
      toast({
        title: 'Error',
        description: error.message || 'Failed to send magic link',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      if (error) throw error;
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google');
      toast({
        title: 'Error',
        description: error.message || 'Failed to sign in with Google',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setMagicLinkSent(false);
    setError(null);
    form.reset();
  };

  if (magicLinkSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Check Your Email</CardTitle>
          <CardDescription>
            We&apos;ve sent a magic link to <strong>{form.getValues('email')}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="w-4 h-4" />
            <AlertDescription>
              Click the link in your email to sign in instantly. The link expires in 1 hour.
            </AlertDescription>
          </Alert>

          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600">Didn&apos;t receive the email?</p>
            <Button
              variant="outline"
              onClick={() => {
                resetForm();
                setAuthMode('magic');
              }}
              className="w-full"
            >
              Send Another Link
            </Button>
          </div>

          <Button
            variant="ghost"
            onClick={resetForm}
            className="w-full"
          >
            Back to Sign In
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader className="text-center pb-8">
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Welcome to ProjectX
          </CardTitle>
          <CardDescription className="text-lg">
            Choose your preferred sign-in method
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Auth Mode Switcher */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <Button
              type="button"
              variant={authMode === 'google' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setAuthMode('google')}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button
              type="button"
              variant={authMode === 'magic' ? 'default' : 'ghost'}
              className="flex-1"
              onClick={() => setAuthMode('magic')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Magic Link
            </Button>
          </div>

          {authMode === 'google' ? (
            // Google Authentication Section
            <div className="space-y-4">
              <Button
                type="button"
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Signing you in...
                  </>
                ) : (
                  <>
                    <Image
                      src="https://authjs.dev/img/providers/google.svg"
                      alt="Google"
                      width={24}
                      height={24}
                      className="mr-3"
                    />
                    Continue with Google
                  </>
                )}
              </Button>

              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>🔒 Secure authentication with Google</p>
                <p>We never store your Google password</p>
              </div>
            </div>
          ) : (
            // Magic Link Authentication Section
            <div className="space-y-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleMagicLinkSignIn)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="enter@your-email.com"
                            type="email"
                            autoComplete="email"
                            className="h-12"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                        Sending Magic Link...
                      </>
                    ) : (
                      <>
                        <Zap className="w-5 h-5 mr-3" />
                        Send Magic Link
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center text-sm text-gray-500 space-y-1">
                <p>✨ Passwordless authentication</p>
                <p>Check your email for a secure sign-in link</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}