import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  // If there's an auth error, don't redirect - let the page handle it
  if (error) {
    console.log('Auth middleware error:', error.message)
    return supabaseResponse
  }

  // Protected routes that require authentication
  const protectedPaths = ['/dashboard', '/admin', '/user-panel', '/private', '/adminpanel']
  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Public routes that don't require authentication
  const publicPaths = ['/', '/login', '/auth', '/api', '/_next', '/favicon.ico', '/favicon.png']
  const isPublicRoute = publicPaths.some(path => 
    request.nextUrl.pathname.startsWith(path)
  )

  // Skip static files and images
  if (request.nextUrl.pathname.includes('.') && 
      (request.nextUrl.pathname.endsWith('.js') || 
       request.nextUrl.pathname.endsWith('.css') ||
       request.nextUrl.pathname.endsWith('.png') ||
       request.nextUrl.pathname.endsWith('.jpg') ||
       request.nextUrl.pathname.endsWith('.ico'))) {
    return supabaseResponse
  }

  // Only redirect to login if:
  // 1. User is not authenticated
  // 2. They're trying to access a protected route
  // 3. They're not already on a public route
  // 4. No auth error occurred
  if (!user && isProtectedRoute && !isPublicRoute && !error) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Redirect authenticated users away from login page
  if (user && request.nextUrl.pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}

