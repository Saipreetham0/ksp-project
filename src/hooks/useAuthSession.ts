"use client";

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import { UserProfile } from '@/types/database';
import { toast } from '@/hooks/use-toast';

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export function useAuthSession() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
    error: null,
  });

  const supabase = createClient();

  const fetchUserProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        // If profile doesn't exist, create one
        if (error.code === 'PGRST116') {
          const { data: user } = await supabase.auth.getUser();
          if (user.user) {
            const newProfile: Partial<UserProfile> = {
              id: user.user.id,
              email: user.user.email || '',
              full_name: user.user.user_metadata?.full_name || user.user.email || '',
              role: 'user',
              status: 'active',
              permissions: {},
              notification_preferences: {
                email: true,
                push: true,
                sms: false,
                task_assigned: true,
                payment_received: true,
                order_status_changed: true,
                invoice_sent: true
              },
              timezone: 'Asia/Kolkata',
              language: 'en'
            };

            const { data: createdProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert([newProfile])
              .select()
              .single();

            if (!createError) {
              return createdProfile;
            }
          }
        }
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [supabase]);

  const updateAuthState = useCallback(async (session: Session | null) => {
    if (session?.user) {
      const profile = await fetchUserProfile(session.user.id);
      setAuthState({
        user: session.user,
        session,
        profile,
        loading: false,
        error: null,
      });
    } else {
      setAuthState({
        user: null,
        session: null,
        profile: null,
        loading: false,
        error: null,
      });
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          setAuthState(prev => ({ 
            ...prev, 
            loading: false, 
            error: error.message 
          }));
          return;
        }

        await updateAuthState(session);
      } catch (error) {
        console.error('Error getting initial session:', error);
        setAuthState(prev => ({ 
          ...prev, 
          loading: false, 
          error: 'Failed to get session' 
        }));
      }
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth event:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          session: null,
          profile: null,
          loading: false,
          error: null,
        });
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        await updateAuthState(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, updateAuthState]);

  const signOut = useCallback(async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }));
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      // The auth state change listener will handle updating the state
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Error',
        description: 'Failed to sign out',
        variant: 'destructive',
      });
    }
  }, [supabase]);

  const refreshSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.refreshSession();
      
      if (error) throw error;
      
      await updateAuthState(session);
      return session;
    } catch (error) {
      console.error('Error refreshing session:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: 'Failed to refresh session' 
      }));
      return null;
    }
  }, [supabase, updateAuthState]);

  return {
    ...authState,
    signOut,
    refreshSession,
    supabase,
  };
}