"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
  Zap,
  Shield,
  Lock,
  ArrowRight
} from 'lucide-react';
import Image from 'next/image';

const emailSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type EmailFormData = z.infer<typeof emailSchema>;

interface ProfessionalAuthFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

export default function ProfessionalAuthForm({
  onSuccess,
  redirectTo = '/dashboard'
}: ProfessionalAuthFormProps) {
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
      <div className="w-full max-w-md mx-auto">
        <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur">
          <CardHeader className="text-center pb-6">
            <div className="mx-auto mb-4 p-3 bg-emerald-100 rounded-full w-fit">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
            <p className="text-gray-600 mt-2">
              We've sent a magic link to <span className="font-semibold text-blue-600">{form.getValues('email')}</span>
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <Mail className="w-4 h-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                Click the link in your email to sign in instantly. The link expires in 1 hour.
              </AlertDescription>
            </Alert>

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">Didn't receive the email?</p>
              <Button
                variant="outline"
                onClick={() => {
                  resetForm();
                  setAuthMode('magic');
                }}
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
              >
                <Mail className="w-4 h-4 mr-2" />
                Send Another Link
              </Button>

              <Button
                variant="ghost"
                onClick={resetForm}
                className="w-full text-gray-600 hover:text-gray-800"
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Back to Sign In
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <Card className="border-0 shadow-2xl bg-white/95 backdrop-blur overflow-hidden">
        <CardHeader className="text-center pb-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="mb-6">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Welcome to ProjectX
            </span>
          </CardTitle>
          <p className="text-gray-600 mt-2 text-lg">
            Professional project management platform
          </p>
        </CardHeader>

        <CardContent className="p-8 space-y-6">
          {error && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}

          {/* Auth Mode Tabs */}
          <div className="flex bg-gray-100 p-1 rounded-xl">
            <Button
              type="button"
              variant={authMode === 'google' ? 'default' : 'ghost'}
              className={`flex-1 rounded-lg font-medium transition-all ${
                authMode === 'google' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setAuthMode('google')}
            >
              <Chrome className="w-4 h-4 mr-2" />
              Google
            </Button>
            <Button
              type="button"
              variant={authMode === 'magic' ? 'default' : 'ghost'}
              className={`flex-1 rounded-lg font-medium transition-all ${
                authMode === 'magic' 
                  ? 'bg-white text-purple-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-800'
              }`}
              onClick={() => setAuthMode('magic')}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Magic Link
            </Button>
          </div>

          {authMode === 'google' ? (
            <div className="space-y-6">
              <Button
                type="button"
                className="w-full h-14 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Connecting...
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
                    <ArrowRight className="w-5 h-5 ml-3" />
                  </>
                )}
              </Button>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Lock className="w-4 h-4" />
                  <span>Secured by Google OAuth 2.0</span>
                </div>
                <p className="text-xs text-gray-400">
                  We never store your Google password
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleMagicLinkSignIn)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-gray-700 font-medium">Email Address</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="your-email@company.com"
                            type="email"
                            autoComplete="email"
                            className="h-12 border-gray-300 rounded-xl focus:border-purple-500 focus:ring-purple-500"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Button
                    type="submit"
                    className="w-full h-14 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold text-lg rounded-xl shadow-lg transition-all duration-200 hover:shadow-xl"
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
                        <ArrowRight className="w-5 h-5 ml-3" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <div className="text-center space-y-2">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Sparkles className="w-4 h-4" />
                  <span>Passwordless authentication</span>
                </div>
                <p className="text-xs text-gray-400">
                  Secure sign-in link sent to your email
                </p>
              </div>
            </div>
          )}

          <Separator className="my-6" />

          <div className="text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              By continuing, you agree to our{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}