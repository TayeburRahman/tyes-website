import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  
  if (code) {
    const supabase = await createClient()
    await supabase.auth.exchangeCodeForSession(code)
    
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('country, role')
        .eq('id', user.id)
        .single()
        
      if (!profile?.country) {
        // Missing required profile info (like for Google Auth signups)
        return NextResponse.redirect(`${requestUrl.origin}/auth/complete-profile`)
      }
      
      const role = profile?.role || user.user_metadata?.role || "client"
      const isAdmin = ["admin", "superAdmin"].includes(role)
      return NextResponse.redirect(`${requestUrl.origin}${isAdmin ? '/dashboard/admin' : '/dashboard/client'}`)
    }
  }

  // Fallback if no code or user
  return NextResponse.redirect(`${requestUrl.origin}/auth`)
}
