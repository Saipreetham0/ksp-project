// src/hooks/useAuth.ts
// Firebase imports removed - replaced with Supabase
import { useState, useEffect } from "react";
// import {
//   User,
//   onAuthStateChanged,
//   GoogleAuthProvider,
//   signInWithPopup,
//   signOut as firebaseSignOut,
// } from "firebase/auth";
// import { auth, db } from "@/lib/firebase";
// import { doc, getDoc, setDoc } from "firebase/firestore";
import { createClient } from '@/utils/supabase/client';
import type { User } from '@supabase/supabase-js';
import { useRouter } from "next/navigation";
import { UserData } from "@/types/auth";
import { ROLE_PERMISSIONS } from "@/lib/roles";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        setUser(session.user);
        
        // Fetch user profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const userProfileData: UserData = {
            uid: profile.id,
            email: profile.email,
            role: profile.role || "user",
            displayName: profile.display_name,
            photoURL: profile.avatar_url,
            createdAt: profile.created_at,
            lastLogin: profile.last_sign_in_at || profile.created_at,
          };
          setUserData(userProfileData);
        } else {
          // Create new user profile with default role
          const newUserData = {
            id: session.user.id,
            email: session.user.email!,
            role: "user",
            display_name: session.user.user_metadata?.full_name || null,
            avatar_url: session.user.user_metadata?.avatar_url || null,
            created_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
          };
          
          await supabase.from('profiles').insert([newUserData]);
          
          const userProfileData: UserData = {
            uid: session.user.id,
            email: session.user.email!,
            role: "user",
            displayName: session.user.user_metadata?.full_name,
            photoURL: session.user.user_metadata?.avatar_url,
            createdAt: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
          };
          setUserData(userProfileData);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch updated profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            const userProfileData: UserData = {
              uid: profile.id,
              email: profile.email,
              role: profile.role || "user",
              displayName: profile.display_name,
              photoURL: profile.avatar_url,
              createdAt: profile.created_at,
              lastLogin: profile.last_sign_in_at || profile.created_at,
            };
            setUserData(userProfileData);
          }
        } else {
          setUserData(null);
        }
        setLoading(false);
      }
    );

    return () => subscription?.unsubscribe();
  }, [supabase.auth]);

  const hasPermission = (permission: string): boolean => {
    return userData
      ? ROLE_PERMISSIONS[userData.role]?.includes(permission) ?? false
      : false;
  };

  const signInWithGoogle = async () => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error("Google sign-in error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/");
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  };

  return {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    signOut,
    hasPermission,
  };
}
