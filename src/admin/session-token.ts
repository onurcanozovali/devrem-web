import { Buffer } from 'node:buffer';
import {
  isAdminRole,
  type AdminIdentity,
} from '@/src/admin/access';

type LegacySessionPayload = {
  username: string;
  expiresAt: number;
  version: 1;
};

export type SignedAdminSession = AdminIdentity & {
  expiresAt: number;
  version: 2;
};

function encode(value: string | Uint8Array) {
  return Buffer.from(value).toString('base64url');
}

async function signature(value: string, secret: string) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return encode(new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(value))));
}

function constantEqual(left: string, right: string) {
  const leftBytes = Buffer.from(left);
  const rightBytes = Buffer.from(right);
  let mismatch = leftBytes.length ^ rightBytes.length;
  const length = Math.max(leftBytes.length, rightBytes.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (leftBytes[index] ?? 0) ^ (rightBytes[index] ?? 0);
  }
  return mismatch === 0;
}

export async function secureValueMatches({ value, expected, namespace, secret }: { value: string; expected: string; namespace: string; secret: string }) {
  const [providedSignature, storedSignature] = await Promise.all([
    signature(`${namespace}:${value}`, secret),
    signature(`${namespace}:${expected}`, secret),
  ]);
  return constantEqual(providedSignature, storedSignature);
}

export async function createSignedAdminSession(identity: AdminIdentity, expiresAt: number, secret: string) {
  const payload: SignedAdminSession = { ...identity, expiresAt, version: 2 };
  const encoded = encode(JSON.stringify(payload));
  return `${encoded}.${await signature(encoded, secret)}`;
}

export async function verifySignedAdminSession(token: string | undefined, secret: string, legacyUsername?: string) {
  if (!token) return null;
  const [encoded, suppliedSignature, extra] = token.split('.');
  if (!encoded || !suppliedSignature || extra) return null;
  if (!constantEqual(suppliedSignature, await signature(encoded, secret))) return null;
  try {
    const payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as SignedAdminSession | LegacySessionPayload;
    if (!payload.expiresAt || payload.expiresAt <= Date.now()) return null;
    if (payload.version === 1) {
      if (!legacyUsername || payload.username !== legacyUsername) return null;
      return { uid: `legacy:${payload.username}`, email: payload.username, displayName: payload.username, role: 'super_admin', provider: 'legacy', expiresAt: payload.expiresAt, version: 2 } satisfies SignedAdminSession;
    }
    if (payload.version !== 2 || !payload.uid || !payload.displayName || !isAdminRole(payload.role) || !payload.provider) return null;
    return payload;
  } catch {
    return null;
  }
}
