import { NextResponse } from "next/server";
// The client you created from the Server-Side Auth instructions
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await (await supabase).auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      } else {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`);
}


// import { NextResponse } from "next/server";
// import { createClient } from "@/utils/supabase/server";

// export async function GET(request: Request) {
//   const { searchParams, origin } = new URL(request.url);
//   const code = searchParams.get("code");
//   const next = searchParams.get("next") ?? "/dashboard";

//   if (code) {
//     const supabase = createClient();

//     // Exchange the code for a session
//     const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);

//     if (!error && session?.user) {
//       try {
//         // Check if user exists in users table
//         const { data: existingUser } = await supabase
//           .from('users')
//           .select()
//           .eq('id', session.user.id)
//           .single();

//         // If user doesn't exist, insert them
//         if (!existingUser) {
//           const { error: insertError } = await supabase
//             .from('users')
//             .insert({
//               id: session.user.id,
//               full_name: session.user.user_metadata.full_name,
//               email: session.user.email,
//               avatar_url: session.user.user_metadata.avatar_url,
//             });

//           if (insertError) {
//             console.error('Error inserting user:', insertError);
//             // Continue with redirect even if insert fails - we can handle this later
//           }
//         }

//         // Handle redirects based on environment
//         const forwardedHost = request.headers.get("x-forwarded-host");
//         const isLocalEnv = process.env.NODE_ENV === "development";

//         if (isLocalEnv) {
//           return NextResponse.redirect(`${origin}${next}`);
//         } else if (forwardedHost) {
//           return NextResponse.redirect(`https://${forwardedHost}${next}`);
//         } else {
//           return NextResponse.redirect(`${origin}${next}`);
//         }
//       } catch (error) {
//         console.error('Error in user data handling:', error);
//         // If there's an error handling user data, still redirect to dashboard
//         // rather than showing an error page, since auth itself succeeded
//         const forwardedHost = request.headers.get("x-forwarded-host");
//         const isLocalEnv = process.env.NODE_ENV === "development";
//         return isLocalEnv
//           ? NextResponse.redirect(`${origin}${next}`)
//           : forwardedHost
//             ? NextResponse.redirect(`https://${forwardedHost}${next}`)
//             : NextResponse.redirect(`${origin}${next}`);
//       }
//     }
//   }

//   // return the user to an error page with instructions
//   return NextResponse.redirect(`${origin}/auth/auth-code-error`);
// }