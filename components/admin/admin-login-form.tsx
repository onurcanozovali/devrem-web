'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { FirebaseError, getApp, getApps, initializeApp } from 'firebase/app';
import {
  getAuth,
  getMultiFactorResolver,
  inMemoryPersistence,
  multiFactor,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
  TotpMultiFactorGenerator,
  type Auth,
  type MultiFactorError,
  type MultiFactorResolver,
  type TotpSecret,
  type User,
} from 'firebase/auth';
import { ArrowLeft, LockKeyhole, LogIn, QrCode } from 'lucide-react';
import QRCode from 'qrcode';

export type AdminFirebaseClientConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
};

type LoginPhase = 'credentials' | 'enrollment' | 'challenge';
type SessionResponse = { code?: string; error?: string; ok?: boolean };

function firebaseErrorMessage(error: unknown) {
  const code = error instanceof FirebaseError ? error.code : '';
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'E-posta veya parola hatalı.';
    case 'auth/invalid-verification-code':
    case 'auth/invalid-app-credential':
      return 'Kod geçersiz. Authenticator uygulamasındaki güncel kodu dene.';
    case 'auth/code-expired':
      return 'Kodun süresi doldu. Güncel kodu dene.';
    case 'auth/unverified-email':
      return 'Admin e-posta adresi doğrulanmış olmalı.';
    case 'auth/operation-not-allowed':
      return 'Firebase TOTP MFA henüz etkinleştirilmemiş.';
    case 'auth/too-many-requests':
      return 'Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.';
    default:
      return 'Giriş doğrulanamadı. Lütfen tekrar dene.';
  }
}

function getAdminAuth(config: AdminFirebaseClientConfig) {
  const name = 'devrem-admin';
  const app = getApps().some((candidate) => candidate.name === name)
    ? getApp(name)
    : initializeApp(config, name);
  return getAuth(app);
}

async function requestAdminSession(idToken: string) {
  const response = await fetch('/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ idToken }),
  });
  const result = (await response.json()) as SessionResponse;
  return { response, result };
}

function normalizeCode(value: string) {
  return value.replace(/\D/g, '').slice(0, 6);
}

export function AdminLoginForm({
  firebaseConfig,
}: {
  firebaseConfig: AdminFirebaseClientConfig | null;
}) {
  const [phase, setPhase] = useState<LoginPhase>('credentials');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const authRef = useRef<Auth | null>(null);
  const [resolver, setResolver] = useState<MultiFactorResolver | null>(null);
  const [enrollmentUser, setEnrollmentUser] = useState<User | null>(null);
  const [totpSecret, setTotpSecret] = useState<TotpSecret | null>(null);
  const [qrCode, setQrCode] = useState('');

  async function finishSession(user: User) {
    const { response, result } = await requestAdminSession(
      await user.getIdToken(true),
    );
    if (response.ok) {
      if (authRef.current) await signOut(authRef.current).catch(() => undefined);
      window.location.assign('/admin/dashboard');
      return 'complete' as const;
    }
    if (response.status === 428 && result.code === 'mfa-enrollment-required') {
      return 'enroll' as const;
    }
    throw new Error(result.error ?? 'Admin oturumu oluşturulamadı.');
  }

  async function beginEnrollment(user: User) {
    const session = await multiFactor(user).getSession();
    const secret = await TotpMultiFactorGenerator.generateSecret(session);
    const uri = secret.generateQrCodeUrl(user.email ?? 'admin', 'Devrem Admin');
    setEnrollmentUser(user);
    setTotpSecret(secret);
    setQrCode(
      await QRCode.toDataURL(uri, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 240,
      }),
    );
    setCode('');
    setPhase('enrollment');
  }

  async function submitCredentials() {
    if (!firebaseConfig) {
      throw new Error('Firebase admin giriş yapılandırması eksik.');
    }
    const nextAuth = getAdminAuth(firebaseConfig);
    await setPersistence(nextAuth, inMemoryPersistence);
    authRef.current = nextAuth;
    try {
      const credential = await signInWithEmailAndPassword(
        nextAuth,
        email.trim(),
        password,
      );
      setPassword('');
      const result = await finishSession(credential.user);
      if (result === 'enroll') await beginEnrollment(credential.user);
    } catch (caught) {
      if (
        caught instanceof FirebaseError &&
        caught.code === 'auth/multi-factor-auth-required'
      ) {
        const nextResolver = getMultiFactorResolver(
          nextAuth,
          caught as MultiFactorError,
        );
        const hasTotp = nextResolver.hints.some(
          (hint) => hint.factorId === TotpMultiFactorGenerator.FACTOR_ID,
        );
        if (!hasTotp) {
          throw new Error(
            'Bu admin hesabında TOTP Authenticator kayıtlı değil.',
          );
        }
        setPassword('');
        setResolver(nextResolver);
        setCode('');
        setPhase('challenge');
        return;
      }
      throw caught;
    }
  }

  async function submitEnrollment() {
    if (!totpSecret || !enrollmentUser || code.length !== 6) {
      throw new Error('Authenticator uygulamasındaki 6 haneli kodu gir.');
    }
    const assertion = TotpMultiFactorGenerator.assertionForEnrollment(
      totpSecret,
      code,
    );
    await multiFactor(enrollmentUser).enroll(assertion, 'Devrem Admin TOTP');
    await finishSession(enrollmentUser);
  }

  async function submitChallenge() {
    if (!resolver || code.length !== 6) {
      throw new Error('Authenticator uygulamasındaki 6 haneli kodu gir.');
    }
    const hint = resolver.hints.find(
      (candidate) => candidate.factorId === TotpMultiFactorGenerator.FACTOR_ID,
    );
    if (!hint) throw new Error('TOTP Authenticator kaydı bulunamadı.');
    const assertion = TotpMultiFactorGenerator.assertionForSignIn(
      hint.uid,
      code,
    );
    const credential = await resolver.resolveSignIn(assertion);
    await finishSession(credential.user);
  }

  async function reset() {
    if (authRef.current) await signOut(authRef.current).catch(() => undefined);
    setPhase('credentials');
    setResolver(null);
    setEnrollmentUser(null);
    setTotpSecret(null);
    setQrCode('');
    setCode('');
    setPassword('');
    setError('');
  }

  return (
    <form
      className="admin-login-form"
      onSubmit={async (event) => {
        event.preventDefault();
        setBusy(true);
        setError('');
        try {
          if (phase === 'credentials') await submitCredentials();
          if (phase === 'enrollment') await submitEnrollment();
          if (phase === 'challenge') await submitChallenge();
        } catch (caught) {
          setError(
            caught instanceof Error && !(caught instanceof FirebaseError)
              ? caught.message
              : firebaseErrorMessage(caught),
          );
        } finally {
          setBusy(false);
        }
      }}
    >
      {phase === 'credentials' ? (
        <>
          <label>
            <span>E-posta</span>
            <input
              autoComplete="username"
              inputMode="email"
              name="email"
              onChange={(event) => setEmail(event.target.value)}
              required
              type="email"
              value={email}
            />
          </label>
          <label>
            <span>Parola</span>
            <input
              autoComplete="current-password"
              name="password"
              onChange={(event) => setPassword(event.target.value)}
              required
              type="password"
              value={password}
            />
          </label>
        </>
      ) : null}

      {phase === 'enrollment' ? (
        <div className="admin-mfa-enrollment">
          <div className="admin-mfa-heading">
            <QrCode className="size-5" aria-hidden="true" />
            <div>
              <strong>Authenticator kurulumu</strong>
              <p>QR kodu Google veya Microsoft Authenticator ile okut.</p>
            </div>
          </div>
          {qrCode ? (
            <Image
              alt="Devrem Admin TOTP kurulum QR kodu"
              height={240}
              src={qrCode}
              unoptimized
              width={240}
            />
          ) : null}
          <p className="admin-mfa-secret">
            <span>Manuel kurulum anahtarı</span>
            <code>{totpSecret?.secretKey}</code>
          </p>
        </div>
      ) : null}

      {phase !== 'credentials' ? (
        <label>
          <span>6 haneli doğrulama kodu</span>
          <input
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={6}
            onChange={(event) => setCode(normalizeCode(event.target.value))}
            pattern="[0-9]{6}"
            required
            value={code}
          />
        </label>
      ) : null}

      {phase === 'challenge' ? (
        <p className="admin-mfa-note">
          Authenticator uygulamasındaki güncel kodu girerek devam et.
        </p>
      ) : null}

      {error ? (
        <p className="admin-form-error" role="alert">
          {error}
        </p>
      ) : null}

      <button disabled={busy || !firebaseConfig} type="submit">
        {busy ? (
          <LockKeyhole className="size-4" aria-hidden="true" />
        ) : (
          <LogIn className="size-4" aria-hidden="true" />
        )}
        {busy
          ? 'Doğrulanıyor…'
          : phase === 'enrollment'
            ? 'Kurulumu tamamla'
            : phase === 'challenge'
              ? 'Kodu doğrula'
              : 'Giriş yap'}
      </button>

      {phase !== 'credentials' ? (
        <button
          className="admin-mfa-back"
          disabled={busy}
          onClick={() => void reset()}
          type="button"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          Girişe dön
        </button>
      ) : null}
    </form>
  );
}
