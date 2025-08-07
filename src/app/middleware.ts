// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";

// export function middleware(request: NextRequest) {
//   const session = request.cookies.get("session");

//   if (request.nextUrl.pathname.startsWith("/dashboard")) {
//     if (!session) {
//       return NextResponse.redirect(new URL("/", request.url));
//     }
//   }

//   if (request.nextUrl.pathname === "/" && session) {
//     return NextResponse.redirect(new URL("/dashboard", request.url));
//   }

//   return NextResponse.next();
// }

import { type NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}



// import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
// import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';

// export async function middleware(req: NextRequest) {
//   const res = NextResponse.next();
//   const supabase = createMiddlewareClient({ req, res });

//   const {
//     data: { session },
//   } = await supabase.auth.getSession();

//   // Protected routes
//   if (!session && req.nextUrl.pathname.startsWith('/dashboard')) {
//     return NextResponse.redirect(new URL('/login', req.url));
//   }

//   // Auth routes - redirect if already logged in
//   if (session && (req.nextUrl.pathname === '/login' || req.nextUrl.pathname === '/signup')) {
//     return NextResponse.redirect(new URL('/dashboard', req.url));
//   }

//   return res;
// }

// export const config = {
//   matcher: ['/dashboard/:path*', '/login', '/signup'],
// };
