"use client";

import { useEffect, useRef, useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { toast } from '@/hooks/use-toast';

interface GoogleOneTapSignInProps {
  onSuccess?: () => void;
  redirectTo?: string;
}

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (callback?: (response: any) => void) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleOneTapSignIn({ 
  onSuccess, 
  redirectTo = '/dashboard' 
}: GoogleOneTapSignInProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const supabase = createClient();
  const initializationAttempted = useRef(false);

  // Disable Google One Tap for now to prevent console errors
  // This component will be invisible but can be re-enabled later
  if (!process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
    return null;
  }

  useEffect(() => {
    // Load Google Identity Services script
    const loadGoogleScript = () => {
      if (window.google?.accounts?.id || document.getElementById('google-identity-script')) {
        setScriptLoaded(true);
        return;
      }

      const script = document.createElement('script');
      script.id = 'google-identity-script';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        setScriptLoaded(true);
      };

      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
      };

      document.head.appendChild(script);
    };

    loadGoogleScript();
  }, []);

  useEffect(() => {
    if (!scriptLoaded || !window.google?.accounts?.id || initializationAttempted.current) {
      return;
    }

    initializationAttempted.current = true;

    const handleCredentialResponse = async (response: any) => {
      if (!response.credential) {
        console.error('No credential received from Google');
        return;
      }

      setIsLoading(true);

      try {
        // For Google One Tap, we need to handle the JWT token differently
        // This might need additional configuration in your Supabase project
        console.log('Google One Tap credential received:', response.credential);
        
        // For now, let's use the standard OAuth flow instead
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
          },
        });

        if (error) throw error;

        toast({
          title: 'Welcome! 🎉',
          description: 'Successfully signed in with Google.',
        });

        onSuccess?.();
        window.location.href = redirectTo;
      } catch (error: any) {
        console.error('Google One Tap sign-in error:', error);
        toast({
          title: 'Sign-in Error',
          description: error.message || 'Failed to sign in with Google One Tap',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    try {
      // Initialize Google One Tap
      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        context: 'signin',
        ux_mode: 'popup',
      });

      // Only show the One Tap prompt if we have a client ID configured
      if (process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID) {
        // Small delay to ensure DOM is ready
        setTimeout(() => {
          window.google?.accounts.id.prompt((notification: any) => {
            if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
              // One Tap prompt was not shown or was dismissed
              console.log('Google One Tap prompt not shown:', notification.getNotDisplayedReason?.());
            }
          });
        }, 500);
      }
    } catch (error) {
      console.error('Failed to initialize Google One Tap:', error);
    }
  }, [scriptLoaded, supabase, onSuccess, redirectTo]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.google?.accounts?.id) {
        try {
          window.google.accounts.id.cancel();
        } catch (error) {
          // Ignore cleanup errors
        }
      }
    };
  }, []);

  // This component renders nothing visible but handles the One Tap flow
  return null;
}