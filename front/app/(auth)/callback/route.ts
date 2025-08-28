import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  if (code) {
    const cookieStore = await cookies() // 여기서 cookieStore를 직접 가져옵니다.
    const supabase = createClient(cookieStore) // 가져온 cookieStore를 createClient에 전달합니다.
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(origin)
    }
  }

  console.error("Authentication failed!");
  return NextResponse.redirect(`${origin}/signin?error=auth_failed`);
}