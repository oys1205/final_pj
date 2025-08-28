import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import AES from 'crypto-js/aes';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data: sessionResponse, error: authError } =
      await supabase.auth.exchangeCodeForSession(code);

    if (!authError && sessionResponse.session) {
      const { user, session } = sessionResponse;

      const { error: profileError } = await supabase.from('profiles').upsert({
        id: user.id,
        email: user.email!,
        full_name: user.user_metadata.full_name,
      });

      if (profileError) {
        console.error('🚨 Profile Upsert Error:', profileError.message);
        return NextResponse.redirect(
          `${origin}/auth/signin?error=profile_save_failed`
        );
      }

 
      const secretKey = process.env.CRYPTO_SECRET_KEY;
      if (!secretKey) {
        console.error('🚨 [Error] CRYPTO_SECRET_KEY is not set in .env.local');
        return NextResponse.redirect(
          `${origin}/auth/signin?error=config_error`
        );
      }
      const encryptedAccessToken = AES.encrypt(
        session.access_token,
        secretKey
      ).toString();
      const encryptedRefreshToken = AES.encrypt(
        session.refresh_token,
        secretKey
      ).toString();

      const { error: tokenError } = await supabase.from('user_tokens').upsert({
        user_id: user.id,
        access_token: encryptedAccessToken,
        refresh_token: encryptedRefreshToken,
        expires_at: new Date(session.expires_at! * 1000).toISOString(),
      });

      if (tokenError) {
        console.error('🚨 Token Upsert Error:', tokenError.message);
        return NextResponse.redirect(
          `${origin}/auth/signin?error=token_save_failed`
        );
      }

      // 모든 과정 성공 시 메인 페이지로 이동합니다.
      return NextResponse.redirect(origin);
    }

    if (authError) {
      console.error('🚨 Authentication Error:', authError.message);
    }
  }

  return NextResponse.redirect(`${origin}/auth/signin?error=auth_failed`);
}