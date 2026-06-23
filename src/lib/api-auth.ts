import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

// Returns the authenticated user, or a 401 response to return early.
// Usage:
//   const user = await getUserOr401(supabase);
//   if (user instanceof NextResponse) return user;
export async function getUserOr401(
  supabase: SupabaseClient
): Promise<User | NextResponse> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  if (error || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return user;
}
