import {
  getFirebaseAccessToken,
  isFirebaseServerConfigured,
} from '@/lib/firebase/server';
import {
  isAdminRole,
  type AdminIdentity,
  type AdminRole,
} from '@/src/admin/access';
import { Buffer } from 'node:buffer';

type FirebaseAuthUser = {
  localId?: string;
  email?: string;
  displayName?: string;
  disabled?: boolean;
  customAttributes?: string;
  createdAt?: string;
  lastLoginAt?: string;
};

function projectId() {
  const value = process.env.FIREBASE_PROJECT_ID?.trim();
  if (!value) throw new Error('FIREBASE_PROJECT_ID eksik.');
  return value;
}

function webApiKey() {
  return process.env.FIREBASE_WEB_API_KEY?.trim() ?? '';
}

function claimsFromUser(user: FirebaseAuthUser) {
  try {
    return JSON.parse(user.customAttributes ?? '{}') as Record<string, unknown>;
  } catch {
    return {};
  }
}

function identityFromUser(user: FirebaseAuthUser): AdminIdentity | null {
  const claims = claimsFromUser(user);
  const role = claims.adminRole;
  if (!user.localId || !isAdminRole(role) || user.disabled) return null;
  return {
    uid: user.localId,
    email: user.email ?? '',
    displayName: user.displayName || user.email || 'Devrem Admin',
    role,
    provider: 'firebase',
  };
}

function identityFromIdToken(token: string): AdminIdentity | null {
  try {
    const encoded = token.split('.')[1];
    if (!encoded) return null;
    const claims = JSON.parse(
      Buffer.from(encoded, 'base64url').toString('utf8'),
    ) as Record<string, unknown>;
    if (!isAdminRole(claims.adminRole)) return null;
    const uid =
      typeof claims.user_id === 'string'
        ? claims.user_id
        : typeof claims.sub === 'string'
          ? claims.sub
          : '';
    if (!uid) return null;
    const email = typeof claims.email === 'string' ? claims.email : '';
    return {
      uid,
      email,
      displayName:
        typeof claims.name === 'string' ? claims.name : email || 'Devrem Admin',
      role: claims.adminRole,
      provider: 'firebase',
    };
  } catch {
    return null;
  }
}

export async function authenticateFirebaseAdmin(
  email: string,
  password: string,
) {
  const apiKey = webApiKey();
  if (!apiKey || !email.includes('@')) return null;
  const signIn = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
      cache: 'no-store',
    },
  );
  if (!signIn.ok) return null;
  const token = (await signIn.json()) as { idToken?: string };
  if (!token.idToken) return null;
  const lookup = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken: token.idToken }),
      cache: 'no-store',
    },
  );
  if (!lookup.ok) return null;
  const payload = (await lookup.json()) as { users?: FirebaseAuthUser[] };
  return (
    identityFromUser(payload.users?.[0] ?? {}) ??
    identityFromIdToken(token.idToken)
  );
}

async function authAdminFetch(path: string, init: RequestInit = {}) {
  if (!isFirebaseServerConfigured()) {
    throw new Error('Firebase Admin sunucu yapılandırması eksik.');
  }
  const headers = new Headers(init.headers);
  headers.set('authorization', `Bearer ${await getFirebaseAccessToken()}`);
  if (init.body) headers.set('content-type', 'application/json');
  return fetch(
    `https://identitytoolkit.googleapis.com/v1/projects/${encodeURIComponent(projectId())}/accounts${path}`,
    { ...init, headers, cache: 'no-store' },
  );
}

export type FirebaseAdminUser = AdminIdentity & {
  disabled: boolean;
  createdAt: string | null;
  lastLoginAt: string | null;
};

export async function listFirebaseAdminUsers() {
  const admins: FirebaseAdminUser[] = [];
  const query = new URLSearchParams({ maxResults: '200' });
    const response = await authAdminFetch(`:batchGet?${query.toString()}`);
    if (!response.ok) {
      const detail = (await response.text()).slice(0, 500);
      if (detail.includes('INSUFFICIENT_PERMISSION')) {
        throw new Error(
          'Firebase servis hesabında firebaseauth.users.get IAM yetkisi bulunmuyor.',
        );
      }
      throw new Error(`Firebase admin kullanıcıları alınamadı (${response.status}).`);
    }
    const payload = (await response.json()) as { users?: FirebaseAuthUser[] };
    for (const user of payload.users ?? []) {
      const identity = identityFromUser(user);
      if (!identity) continue;
      admins.push({
        ...identity,
        disabled: Boolean(user.disabled),
        createdAt: user.createdAt
          ? new Date(Number(user.createdAt)).toISOString()
          : null,
        lastLoginAt: user.lastLoginAt
          ? new Date(Number(user.lastLoginAt)).toISOString()
          : null,
      });
    }
  return admins;
}

export async function getFirebaseAdminUser(uid: string) {
  const response = await authAdminFetch(':lookup', {
    method: 'POST',
    body: JSON.stringify({ localId: [uid] }),
  });
  if (!response.ok) return null;
  const payload = (await response.json()) as { users?: FirebaseAuthUser[] };
  const user = payload.users?.[0];
  if (!user) return null;
  return { user, identity: identityFromUser(user), claims: claimsFromUser(user) };
}

export async function setFirebaseAdminRole(
  uid: string,
  role: AdminRole | null,
) {
  const existing = await getFirebaseAdminUser(uid);
  if (!existing) throw new Error('Firebase kullanıcısı bulunamadı.');
  const claims = { ...existing.claims };
  if (role) {
    claims.admin = true;
    claims.adminRole = role;
  } else {
    delete claims.admin;
    delete claims.adminRole;
  }
  const response = await authAdminFetch(':update', {
    method: 'POST',
    body: JSON.stringify({
      localId: uid,
      customAttributes: JSON.stringify(claims),
    }),
  });
  if (!response.ok) {
    throw new Error(`Admin rolü güncellenemedi (${response.status}).`);
  }
}
