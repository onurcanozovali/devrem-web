const STORAGE_KEY = 'devrem.community.session';
const COOLDOWN_KEY = 'devrem.community.lastWrite';

type StoredSession = {
  idToken: string;
  refreshToken: string;
  expiresAt: number;
  uid: string;
  displayName: string;
  isAnonymous: boolean;
};

function readSession(): StoredSession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as StoredSession;
    if (!parsed.idToken || !parsed.refreshToken || !parsed.uid) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeSession(session: StoredSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

async function sessionFromResponse(response: Response) {
  const payload = (await response.json()) as {
    error?: string;
    idToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    uid?: string;
    displayName?: string;
    isAnonymous?: boolean;
  };
  if (!response.ok || !payload.idToken || !payload.refreshToken || !payload.uid) {
    throw new Error(payload.error || 'Oturum başlatılamadı. Lütfen tekrar dene.');
  }
  const session: StoredSession = {
    idToken: payload.idToken,
    refreshToken: payload.refreshToken,
    expiresAt: Date.now() + Math.max(60, (payload.expiresIn ?? 3600) - 60) * 1000,
    uid: payload.uid,
    displayName: payload.displayName || 'Anonim Devre',
    isAnonymous: payload.isAnonymous !== false,
  };
  writeSession(session);
  return session;
}

export async function ensureCommunitySession() {
  const existing = readSession();
  if (existing && existing.expiresAt > Date.now() + 15_000) {
    return existing;
  }
  const response = await fetch('/api/community/session', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      refreshToken: existing?.refreshToken ?? null,
    }),
  });
  return sessionFromResponse(response);
}

export function getCommunityWriteCooldownRemaining() {
  if (typeof window === 'undefined') return 0;
  const raw = window.sessionStorage.getItem(COOLDOWN_KEY);
  const last = raw ? Number(raw) : 0;
  if (!Number.isFinite(last)) return 0;
  return Math.max(0, 8_000 - (Date.now() - last));
}

export function markCommunityWrite() {
  window.sessionStorage.setItem(COOLDOWN_KEY, String(Date.now()));
}

export async function communityRequest<T>(
  path: string,
  body: Record<string, unknown>,
) {
  const remaining = getCommunityWriteCooldownRemaining();
  if (remaining > 0) {
    throw new Error('Biraz yavaş ol. Yeni bir gönderi için kısa süre bekle.');
  }
  const session = await ensureCommunitySession();
  const response = await fetch(path, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${session.idToken}`,
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(payload.error || 'İşlem tamamlanamadı.');
  }
  markCommunityWrite();
  return payload;
}
