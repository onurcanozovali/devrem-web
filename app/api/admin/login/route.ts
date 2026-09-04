import { NextResponse } from 'next/server';
import {
  adminMfaEnrollmentCookie,
  adminSessionCookie,
  assertSameOrigin,
  createAdminMfaEnrollmentTicket,
  createAdminSessionToken,
  verifyAdminMfaEnrollmentTicket,
} from '@/lib/admin/session';
import {
  adminMfaAllowsSession,
  authenticateFirebaseAdminIdToken,
} from '@/lib/firebase/auth-admin';

const invalidCredentials = { error: 'Giriş bilgileri doğrulanamadı.' };

async function rejectInvalidCredentials() {
  await new Promise((resolve) => setTimeout(resolve, 350));
  return NextResponse.json(invalidCredentials, { status: 401 });
}

export async function POST(request: Request) {
  try {
    assertSameOrigin(request);
    const body = (await request.json()) as {
      idToken?: unknown;
    };
    const idToken = typeof body.idToken === 'string' ? body.idToken : '';
    const authentication = await authenticateFirebaseAdminIdToken(idToken);
    if (!authentication) return rejectInvalidCredentials();
    if (!authentication.emailVerified) {
      return NextResponse.json(
        {
          code: 'email-verification-required',
          error: 'Admin e-posta adresi doğrulanmış olmalı.',
        },
        { status: 403 },
      );
    }
    if (!authentication.totpEnrolled) {
      const response = NextResponse.json(
        {
          code: 'mfa-enrollment-required',
          error: 'Authenticator kurulumu gerekli.',
        },
        { status: 428 },
      );
      response.cookies.set(
        adminMfaEnrollmentCookie.name,
        await createAdminMfaEnrollmentTicket(authentication.identity.uid),
        adminMfaEnrollmentCookie.options,
      );
      return response;
    }
    const enrollmentTicketMatches = await verifyAdminMfaEnrollmentTicket(
      request,
      authentication.identity.uid,
    );
    if (!adminMfaAllowsSession(authentication, enrollmentTicketMatches)) {
      return NextResponse.json(
        { code: 'mfa-required', error: 'Authenticator kodu gerekli.' },
        { status: 403 },
      );
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(
      adminSessionCookie.name,
      await createAdminSessionToken(authentication.identity),
      adminSessionCookie.options,
    );
    response.cookies.set(adminMfaEnrollmentCookie.name, '', {
      ...adminMfaEnrollmentCookie.options,
      maxAge: 0,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Giriş yapılamadı.' },
      { status: 400 },
    );
  }
}
