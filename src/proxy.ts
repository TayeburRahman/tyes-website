import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (process.env.HOME_PASSWORD === 'false') {
    if (pathname === '/' || pathname === '/index.html') {
      const response = NextResponse.redirect(new URL('/landing.html', request.url))
      response.cookies.set('tyes_auth', '1', { path: '/' })
      return response
    }
  }

  return await updateSession(request)
}
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with: --
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
