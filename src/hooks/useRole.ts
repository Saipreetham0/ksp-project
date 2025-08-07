// src/hooks/useRole.ts
// Firebase imports removed - replaced with Supabase
import { useState, useEffect } from 'react';
import { useAuth } from "@/app/context/AuthContext";
// import { doc, getDoc } from 'firebase/firestore';
// import { db } from '@/lib/firebase';
import { createClient } from '@/utils/supabase/client';
import type { UserRole } from '@/types/auth';

export function useRole() {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchRole() {
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();

        if (error) throw error;

        if (profile) {
          setRole(profile.role);
        }
      } catch (error) {
        console.error('Error fetching role:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchRole();
  }, [user, supabase]);

  return { role, loading };
}