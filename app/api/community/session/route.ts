import { NextResponse } from 'next/server';
import {
  CommunityAuthError,
  refreshCommunitySession,
  signInAnonymousCommunityUser,
} from '@/lib/community/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as {
      refreshToken?: string | null;
    };
    const refreshToken = body.refreshToken?.trim() ?? '';
    const session = refreshToken
      ? await refreshCommunitySession(refreshToken).catch(() =>
          signInAnonymousCommunityUser(),
        )
      : await signInAnonymousCommunityUser();
    return NextResponse.json({
      idToken: session.idToken,
      refreshToken: session.refreshToken,
      expiresIn: session.expiresIn,
      uid: session.identity.uid,
      displayName: session.identity.displayName,
      isAnonymous: session.identity.isAnonymous,
    });
  } catch (error) {
    const status = error instanceof CommunityAuthError ? error.status : 500;
    const message =
      error instanceof CommunityAuthError
        ? error.message
        : 'Oturum başlatılamadı. Lütfen tekrar dene.';
    return NextResponse.json({ error: message }, { status });
  }
}
