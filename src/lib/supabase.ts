// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';
// import { Database } from '@/types/database';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);



// export const supabase = createClient(supabaseUrl, supabaseAnonKey);
