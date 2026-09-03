import { anonymousDisplayName } from './text';
import type { CommunityAuthIdentity } from './types';

function webApiKey() {
  return (
    process.env.FIREBASE_WEB_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.trim() ||
    process.env.VITE_FIREBASE_API_KEY?.trim() ||
    process.env.EXPO_PUBLIC_FIREBASE_API_KEY?.trim() ||
    ''
  );
}

export class CommunityAuthError extends Error {
  status: number;
  code: string;
  constructor(message: string, status = 401, code = 'AUTH_ERROR') {
    super(message);
    this.name = 'CommunityAuthError';
    this.status = status;
    this.code = code;
  }
}

async function identityToolkitError(
  response: Response,
  operation: string,
  fallback: string,
) {
  const payload = (await response.json().catch(() => null)) as {
    error?: { message?: string };
  } | null;
  const code = payload?.error?.message?.split(' : ')[0] || 'UNKNOWN';
  console.error(`[community-auth] ${operation} failed`, {
    status: response.status,
    code,
  });
  if (code === 'OPERATION_NOT_ALLOWED') {
    return new CommunityAuthError(
      'Anonim oturum şu anda kullanılamıyor.',
      503,
      code,
    );
  }
  if (code === 'API_KEY_INVALID' || code === 'PROJECT_NOT_FOUND') {
    return new CommunityAuthError(
      'Topluluk Firebase yapılandırması geçersiz.',
      503,
      code,
    );
  }
  return new CommunityAuthError(fallback, 503, code);
}

type TokenUser = {
  localId?: string;
  displayName?: string;
  email?: string;
  providerUserInfo?: Array<{ providerId?: string }>;
};

function identityFromUser(
  user: TokenUser,
  idToken: string,
): CommunityAuthIdentity | null {
  const uid = user.localId?.trim() ?? '';
  if (!uid) return null;
  const providers = user.providerUserInfo ?? [];
  const isAnonymous = providers.every(
    (provider) => provider.providerId === 'anonymous',
  );
  return {
    uid,
    isAnonymous,
    displayName: user.displayName?.trim() || (isAnonymous ? anonymousDisplayName(uid) : null),
    email: user.email?.trim() || null,
    idToken,
  };
}

export async function signInAnonymousCommunityUser() {
  const apiKey = webApiKey();
  if (!apiKey) {
    console.error(
      '[community-auth] Anonymous sign-in blocked: Firebase Web API key is missing.',
    );
    throw new CommunityAuthError(
      'Topluluk oturumu şu anda başlatılamıyor.',
      503,
      'MISSING_FIREBASE_WEB_API_KEY',
    );
  }
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ returnSecureToken: true }),
      cache: 'no-store',
    },
  );
  if (!response.ok) {
    throw await identityToolkitError(
      response,
      'Anonymous sign-in',
      'Anonim oturum oluşturulamadı. Lütfen tekrar dene.',
    );
  }
  const payload = (await response.json()) as {
    idToken?: string;
    refreshToken?: string;
    localId?: string;
    expiresIn?: string;
  };
  if (!payload.idToken || !payload.refreshToken || !payload.localId) {
    console.error(
      '[community-auth] Anonymous sign-in returned an incomplete response.',
    );
    throw new CommunityAuthError(
      'Anonim oturum oluşturulamadı.',
      503,
      'INCOMPLETE_AUTH_RESPONSE',
    );
  }
  return {
    idToken: payload.idToken,
    refreshToken: payload.refreshToken,
    expiresIn: Number(payload.expiresIn ?? 3600),
    identity: {
      uid: payload.localId,
      isAnonymous: true,
      displayName: anonymousDisplayName(payload.localId),
      email: null,
      idToken: payload.idToken,
    } satisfies CommunityAuthIdentity,
  };
}

export async function refreshCommunitySession(refreshToken: string) {
  const apiKey = webApiKey();
  if (!apiKey) {
    console.error(
      '[community-auth] Token refresh blocked: Firebase Web API key is missing.',
    );
    throw new CommunityAuthError(
      'Topluluk oturumu şu anda yenilenemiyor.',
      503,
      'MISSING_FIREBASE_WEB_API_KEY',
    );
  }
  const response = await fetch(
    `https://securetoken.googleapis.com/v1/token?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      cache: 'no-store',
    },
  );
  if (!response.ok) {
    const error = await identityToolkitError(
      response,
      'Token refresh',
      'Oturum yenilenemedi.',
    );
    error.status = 401;
    throw error;
  }
  const payload = (await response.json()) as {
    id_token?: string;
    refresh_token?: string;
    expires_in?: string;
    user_id?: string;
  };
  if (!payload.id_token || !payload.refresh_token || !payload.user_id) {
    throw new CommunityAuthError('Oturum yenilenemedi.', 401);
  }
  return {
    idToken: payload.id_token,
    refreshToken: payload.refresh_token,
    expiresIn: Number(payload.expires_in ?? 3600),
    identity: await lookupCommunityIdentity(payload.id_token),
  };
}

export async function lookupCommunityIdentity(idToken: string) {
  const apiKey = webApiKey();
  if (!apiKey) {
    console.error(
      '[community-auth] Token lookup blocked: Firebase Web API key is missing.',
    );
    throw new CommunityAuthError(
      'Topluluk kimliği şu anda doğrulanamıyor.',
      503,
      'MISSING_FIREBASE_WEB_API_KEY',
    );
  }
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ idToken }),
      cache: 'no-store',
    },
  );
  if (!response.ok) {
    const error = await identityToolkitError(
      response,
      'Token lookup',
      'Oturum doğrulanamadı.',
    );
    error.status = 401;
    throw error;
  }
  const payload = (await response.json()) as { users?: TokenUser[] };
  const identity = identityFromUser(payload.users?.[0] ?? {}, idToken);
  if (!identity) throw new CommunityAuthError('Oturum doğrulanamadı.', 401);
  return identity;
}

export async function identityFromRequest(request: Request) {
  const header = request.headers.get('authorization') ?? '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) {
    throw new CommunityAuthError('Yazmak için oturum gerekli.', 401);
  }
  return lookupCommunityIdentity(token);
}
