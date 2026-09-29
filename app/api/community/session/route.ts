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
      preserveAccount?: boolean;
    };
    const refreshToken = body.refreshToken?.trim() ?? '';
    let session;
    if (refreshToken) {
      try {
        session = await refreshCommunitySession(refreshToken);
      } catch (error) {
        if (body.preserveAccount) throw error;
        session = await signInAnonymousCommunityUser();
      }
    } else {
      session = await signInAnonymousCommunityUser();
    }
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
    console.error('[community-session] Session creation failed', {
      status,
      code:
        error instanceof CommunityAuthError ? error.code : 'UNEXPECTED_ERROR',
    });
    const message =
      error instanceof CommunityAuthError
        ? error.message
        : 'Oturum başlatılamadı. Lütfen tekrar dene.';
    return NextResponse.json({ error: message }, { status });
  }
}
