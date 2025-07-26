import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Create a new URL object from the request URL
      const url = new URL(request.url)
      // Construct the final redirect URL using the correct host and the 'next' path
      return NextResponse.redirect(`${url.origin}${next}`)
    }
  }

  // return the user to an error page with instructions
  const url = new URL(request.url)
  return NextResponse.redirect(`${url.origin}/auth/auth-code-error`)
}