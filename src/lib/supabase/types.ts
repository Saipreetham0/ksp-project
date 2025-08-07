// src/lib/supabase/types.ts
export type UserProfile = {
    id: string;
    email: string;
    name: string | null;
    referral_code: string | null;
    referred_by: string | null;
    created_at: string;
  };