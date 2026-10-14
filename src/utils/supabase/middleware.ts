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
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
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

  // Do not run code between createServerClient and getUser. A simple mistake could make it very hard to debug issues with sessions being lost!
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const pathname = request.nextUrl.pathname

  // Redirect to auth if no user and trying to access protected route
  if (!user && pathname.startsWith('/dashboard')) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    return NextResponse.redirect(url)
  }

  if (user) {
    const role = user.user_metadata?.role || 'client'
    const isAdmin = ["admin", "superAdmin"].includes(role)
    
    // Prevent clients from accessing admin dashboard
    if (!isAdmin && pathname.startsWith('/dashboard/admin')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/client'
      return NextResponse.redirect(url)
    }

    // Prevent admins from accessing client dashboard (optional)
    if (isAdmin && pathname.startsWith('/dashboard/client')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard/admin'
      return NextResponse.redirect(url)
    }

    // Redirect from auth page if already logged in (unless explicitly switching accounts or completing profile)
    if (pathname === '/auth') {
      const isSwitching = request.nextUrl.searchParams.has('switch') || request.nextUrl.searchParams.has('logout');
      if (!isSwitching) {
        const url = request.nextUrl.clone()
        url.pathname = isAdmin ? '/dashboard/admin' : '/dashboard/client'
        return NextResponse.redirect(url)
      }
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing the cookies!
  // 4. Return the myNewResponse object.
  // If you do not do these steps, you may cause users to be logged out prematurely.

  return supabaseResponse
}
