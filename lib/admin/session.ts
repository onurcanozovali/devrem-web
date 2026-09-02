import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { authenticateFirebaseAdmin } from '@/lib/firebase/auth-admin';
import {
  hasPermission,
  type AdminIdentity,
  type AdminPermission,
} from '@/src/admin/access';
import {
  createSignedAdminSession,
  secureValueMatches,
  verifySignedAdminSession,
  type SignedAdminSession,
} from '@/src/admin/session-token';

const cookieName = 'devrem_admin_session';
const sessionSeconds = 8 * 60 * 60;

export type AdminSession = SignedAdminSession;

function sessionSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error('ADMIN_SESSION_SECRET en az 32 karakter olmalı.');
  }
  return secret;
}

export async function credentialsMatch(username: string, password: string) {
  const expectedUsername = process.env.ADMIN_USERNAME;
  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedUsername || !expectedPassword) return false;
  const secret = sessionSecret();
  const [usernameMatches, passwordMatches] = await Promise.all([
    secureValueMatches({ value: username, expected: expectedUsername, namespace: 'username', secret }),
    secureValueMatches({ value: password, expected: expectedPassword, namespace: 'password', secret }),
  ]);
  return usernameMatches && passwordMatches;
}

export async function authenticateAdminCredentials(
  identifier: string,
  password: string,
) {
  const firebaseIdentity = await authenticateFirebaseAdmin(identifier, password);
  if (firebaseIdentity) return firebaseIdentity;
  if (!(await credentialsMatch(identifier, password))) return null;
  return {
    uid: `legacy:${identifier}`,
    email: identifier,
    displayName: identifier,
    role: 'super_admin',
    provider: 'legacy',
  } satisfies AdminIdentity;
}

export async function createAdminSessionToken(identity: AdminIdentity) {
  return createSignedAdminSession(identity, Date.now() + sessionSeconds * 1_000, sessionSecret());
}

export async function verifyAdminSessionToken(token: string | undefined) {
  return verifySignedAdminSession(token, sessionSecret(), process.env.ADMIN_USERNAME);
}

function tokenFromCookieHeader(header: string | null) {
  if (!header) return undefined;
  return header
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${cookieName}=`))
    ?.slice(cookieName.length + 1);
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  return verifyAdminSessionToken(cookieStore.get(cookieName)?.value);
}

export async function requireAdminPage(permission?: AdminPermission) {
  const session = await getCurrentAdmin();
  if (!session) redirect('/admin/login');
  if (permission && !hasPermission(session, permission)) {
    redirect('/admin/forbidden');
  }
  return session;
}

export async function authorizeAdminRequest(
  request: Request,
  permission: AdminPermission,
) {
  const session = await verifyAdminSessionToken(
    tokenFromCookieHeader(request.headers.get('cookie')),
  );
  if (!session) return { ok: false as const, status: 401 as const };
  if (!hasPermission(session, permission)) {
    return { ok: false as const, status: 403 as const };
  }
  return { ok: true as const, session };
}

export async function requireAdminRequest(
  request: Request,
  permission: AdminPermission = 'dashboard.read',
) {
  const authorization = await authorizeAdminRequest(request, permission);
  return authorization.ok ? authorization.session : null;
}

export function assertSameOrigin(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) {
    throw new Error('Geçersiz istek kaynağı.');
  }
}

export const adminSessionCookie = {
  name: cookieName,
  maxAge: sessionSeconds,
  options: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    maxAge: sessionSeconds,
  },
};
