'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type SyntheticEvent,
} from 'react';
import { FirebaseError, getApps, initializeApp } from 'firebase/app';
import {
  RecaptchaVerifier,
  browserLocalPersistence,
  getAuth,
  onAuthStateChanged,
  setPersistence,
  signInWithPhoneNumber,
  signOut,
  type Auth,
  type ConfirmationResult,
  type User,
} from 'firebase/auth';
import { doc, getDoc, getFirestore } from 'firebase/firestore';
import { getDownloadURL, getStorage, ref } from 'firebase/storage';
import {
  ArrowRight,
  CheckCircle2,
  LogOut,
  Phone,
  ShieldCheck,
} from 'lucide-react';
import {
  extractTurkishMobileDigits,
  formatTurkishMobile,
  formatTurkishMobileNational,
  toTurkishE164,
} from '@/lib/firebase/phone';

type PublicFirebaseConfig = {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
};

type UserAuthContextValue = {
  auth: Auth | null;
  error: string | null;
  ready: boolean;
  user: User | null;
  signOutUser: () => Promise<void>;
};

const UserAuthContext = createContext<UserAuthContextValue | null>(null);
const USER_AUTH_APP_NAME = 'devrem-user-auth';

export function UserAuthProvider({
  children,
  config,
}: {
  children: ReactNode;
  config: PublicFirebaseConfig | null;
}) {
  const [auth, setAuth] = useState<Auth | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    let unsubscribe: (() => void) | undefined;

    async function start() {
      if (!config) {
        setError('Firebase web yapılandırması eksik.');
        setReady(true);
        return;
      }

      try {
        const app =
          getApps().find(
            (candidate) => candidate.name === USER_AUTH_APP_NAME,
          ) ?? initializeApp(config, USER_AUTH_APP_NAME);
        const nextAuth = getAuth(app);
        nextAuth.languageCode = 'tr';
        await setPersistence(nextAuth, browserLocalPersistence);
        if (!active) return;
        setAuth(nextAuth);
        unsubscribe = onAuthStateChanged(nextAuth, (nextUser) => {
          if (!active) return;
          setUser(nextUser);
          setReady(true);
        });
      } catch {
        if (!active) return;
        setError('Giriş sistemi başlatılamadı. Lütfen daha sonra tekrar dene.');
        setReady(true);
      }
    }

    void start();
    return () => {
      active = false;
      unsubscribe?.();
    };
  }, [config]);

  const value = useMemo<UserAuthContextValue>(
    () => ({
      auth,
      error,
      ready,
      user,
      signOutUser: async () => {
        if (auth) await signOut(auth);
      },
    }),
    [auth, error, ready, user],
  );

  return (
    <UserAuthContext.Provider value={value}>
      {children}
    </UserAuthContext.Provider>
  );
}

export function useUserAuth() {
  const value = useContext(UserAuthContext);
  if (!value) throw new Error('UserAuthProvider bulunamadı.');
  return value;
}

function authErrorMessage(error: unknown) {
  const code = error instanceof FirebaseError ? error.code : '';
  if (code === 'auth/invalid-phone-number')
    return 'Telefon numarası geçerli değil.';
  if (code === 'auth/invalid-verification-code')
    return 'Doğrulama kodu hatalı.';
  if (code === 'auth/code-expired') return 'Kodun süresi doldu. Yeni kod iste.';
  if (code === 'auth/too-many-requests')
    return 'Çok fazla deneme yapıldı. Bir süre sonra tekrar dene.';
  if (code === 'auth/quota-exceeded')
    return 'SMS gönderim kotasına ulaşıldı. Daha sonra tekrar dene.';
  if (code === 'auth/captcha-check-failed')
    return 'Güvenlik doğrulaması tamamlanamadı. Tekrar dene.';
  return 'İşlem tamamlanamadı. Lütfen tekrar dene.';
}

export function PhoneAuthForm() {
  const router = useRouter();
  const { auth, error: authError, ready, user } = useUserAuth();
  const [phoneDigits, setPhoneDigits] = useState('');
  const [code, setCode] = useState('');
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(
    null,
  );
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const captchaContainer = useRef<HTMLDivElement>(null);
  const captchaVerifier = useRef<RecaptchaVerifier | null>(null);

  useEffect(() => {
    if (ready && user) router.replace('/profil');
  }, [ready, router, user]);

  useEffect(
    () => () => {
      captchaVerifier.current?.clear();
    },
    [],
  );

  async function sendCode(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!auth || !captchaContainer.current) return;
    const phoneNumber = toTurkishE164(phoneDigits);
    if (!phoneNumber) {
      setMessage('5 ile başlayan 10 haneli cep telefonu numaranı yaz.');
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      captchaVerifier.current?.clear();
      captchaContainer.current.replaceChildren();
      const verifier = new RecaptchaVerifier(auth, captchaContainer.current, {
        size: 'invisible',
      });
      captchaVerifier.current = verifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, verifier);
      setConfirmation(result);
      setCode('');
    } catch (error) {
      captchaVerifier.current?.clear();
      captchaVerifier.current = null;
      setMessage(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  async function confirmCode(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!confirmation || code.length !== 6) {
      setMessage('SMS ile gelen 6 haneli kodu yaz.');
      return;
    }

    setBusy(true);
    setMessage(null);
    try {
      await confirmation.confirm(code);
      router.replace('/profil');
    } catch (error) {
      setMessage(authErrorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  if (ready && user) {
    return (
      <p className="text-sm text-muted-foreground">
        Profiline yönlendiriliyorsun…
      </p>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_rgba(20,72,55,0.08)] sm:p-9">
      <div className="mb-8 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {confirmation ? (
          <ShieldCheck aria-hidden="true" />
        ) : (
          <Phone aria-hidden="true" />
        )}
      </div>
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-primary">
        Devrem hesabın
      </p>
      <h1 className="text-3xl font-extrabold tracking-[-0.04em] text-foreground sm:text-4xl">
        {confirmation ? 'SMS kodunu doğrula' : 'Telefonunla giriş yap'}
      </h1>
      <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
        {confirmation
          ? `${formatTurkishMobile(phoneDigits)} numarasına gönderilen kodu gir.`
          : 'Mobil uygulamada kullandığın numarayla aynı Devrem hesabına bağlan.'}
      </p>

      {!confirmation ? (
        <form className="mt-8 space-y-5" onSubmit={sendCode}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foreground">
              Telefon numarası
            </span>
            <span className="flex h-14 items-center rounded-2xl border border-border bg-background px-4 text-lg font-semibold transition focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10">
              <span className="shrink-0 text-muted-foreground">+90</span>
              <input
                autoComplete="tel-national"
                className="h-full min-w-0 flex-1 bg-transparent pl-2 font-semibold outline-none"
                inputMode="tel"
                name="phone"
                onChange={(event) =>
                  setPhoneDigits(extractTurkishMobileDigits(event.target.value))
                }
                placeholder="5xx xxx xx xx"
                type="tel"
                value={formatTurkishMobileNational(phoneDigits)}
              />
            </span>
          </label>
          <button
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy || !ready || !auth}
            type="submit"
          >
            {busy ? 'Gönderiliyor…' : 'SMS kodu gönder'}
            {!busy ? (
              <ArrowRight className="size-4" aria-hidden="true" />
            ) : null}
          </button>
        </form>
      ) : (
        <form className="mt-8 space-y-5" onSubmit={confirmCode}>
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-foreground">
              6 haneli kod
            </span>
            <input
              autoComplete="one-time-code"
              className="h-14 w-full rounded-2xl border border-border bg-background px-4 text-center text-2xl font-extrabold tracking-[0.28em] outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
              inputMode="numeric"
              maxLength={6}
              name="code"
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, '').slice(0, 6))
              }
              pattern="[0-9]{6}"
              value={code}
            />
          </label>
          <button
            className="flex h-13 w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={busy || code.length !== 6}
            type="submit"
          >
            {busy ? 'Doğrulanıyor…' : 'Giriş yap'}
            {!busy ? (
              <CheckCircle2 className="size-4" aria-hidden="true" />
            ) : null}
          </button>
          <button
            className="w-full text-sm font-semibold text-primary underline-offset-4 hover:underline"
            onClick={() => {
              setConfirmation(null);
              setCode('');
              setMessage(null);
            }}
            type="button"
          >
            Numarayı değiştir
          </button>
        </form>
      )}

      <div ref={captchaContainer} />
      {message || authError ? (
        <p
          className="mt-5 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700"
          role="alert"
        >
          {message || authError}
        </p>
      ) : null}
      <p className="mt-6 text-xs leading-5 text-muted-foreground">
        SMS doğrulaması Firebase tarafından güvenli biçimde yürütülür.
        Operatörün standart SMS ücretleri uygulanabilir.
      </p>
    </div>
  );
}

type UserProfileData = Record<string, unknown>;

function profileText(data: UserProfileData | null, ...keys: string[]) {
  for (const key of keys) {
    const value = data?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

function profileNumber(data: UserProfileData | null, key: string) {
  const value = data?.[key];
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function maskedPhone(value: string | null) {
  if (!value) return null;
  const digits = value.replace(/\D/g, '');
  if (digits.length < 4) return null;
  return `+90 5** *** ** ${digits.slice(-2)}`;
}

export function UserProfile() {
  const router = useRouter();
  const { auth, error: authError, ready, signOutUser, user } = useUserAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [profileFound, setProfileFound] = useState<boolean | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (ready && !user) router.replace('/giris?next=/profil');
  }, [ready, router, user]);

  useEffect(() => {
    let active = true;
    if (!auth || !user) return;
    const activeAuth = auth;
    const activeUser = user;

    async function loadProfile() {
      try {
        const snapshot = await getDoc(
          doc(getFirestore(activeAuth.app), 'users', activeUser.uid),
        );
        if (!active) return;
        if (!snapshot.exists()) {
          setProfileFound(false);
          return;
        }

        const data = snapshot.data() as UserProfileData;
        setProfile(data);
        setProfileFound(true);
        const photoPath = profileText(data, 'photoPath');
        if (activeUser.photoURL) {
          setPhotoUrl(activeUser.photoURL);
        } else if (photoPath) {
          try {
            const resolved = /^https?:\/\//.test(photoPath)
              ? photoPath
              : await getDownloadURL(
                  ref(getStorage(activeAuth.app), photoPath),
                );
            if (active) setPhotoUrl(resolved);
          } catch {
            if (active) setPhotoUrl(null);
          }
        }
      } catch {
        if (active) setProfileError('Profil bilgileri şu anda okunamadı.');
      }
    }

    void loadProfile();
    return () => {
      active = false;
    };
  }, [auth, user]);

  if (!ready || !user) {
    return <p className="text-sm text-muted-foreground">Profil yükleniyor…</p>;
  }

  const firstName = profileText(profile, 'firstName');
  const lastName = profileText(profile, 'lastName');
  const profileName =
    [firstName, lastName].filter(Boolean).join(' ') || user.displayName || null;
  const periodYear = profileNumber(profile, 'militaryPeriodYear');
  const periodMonth = profileNumber(profile, 'militaryPeriodMonth');
  const period =
    periodYear && periodMonth
      ? `${String(periodMonth).padStart(2, '0')}/${periodYear}`
      : null;
  const city = profileNumber(profile, 'militaryCity');
  const facts = [
    ['Telefon', maskedPhone(user.phoneNumber)],
    ['Askerlik dönemi', period],
    ['Askerlik türü', profileText(profile, 'militaryType')],
    ['Görev şehri kodu', city ? String(city) : null],
    [
      'Birlik',
      profileText(profile, 'militaryUnitNameSnapshot', 'militaryUnit'),
    ],
  ].filter((item): item is [string, string] => Boolean(item[1]));

  return (
    <div className="w-full max-w-4xl">
      <div className="rounded-[2rem] border border-border bg-surface p-6 shadow-[0_24px_70px_rgba(20,72,55,0.08)] sm:p-9">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xl font-extrabold text-primary">
              {photoUrl ? (
                <svg
                  className="size-full"
                  preserveAspectRatio="xMidYMid slice"
                  viewBox="0 0 64 64"
                >
                  <title>Profil fotoğrafı</title>
                  <image height="64" href={photoUrl} width="64" />
                </svg>
              ) : (
                (firstName?.slice(0, 1) || 'D').toUpperCase()
              )}
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
                Devrem profilin
              </p>
              <h1 className="mt-1 text-3xl font-extrabold tracking-[-0.04em] text-foreground">
                {profileName || 'Profilim'}
              </h1>
            </div>
          </div>
          <button
            className="inline-flex h-11 items-center justify-center gap-2 rounded-full border border-border px-5 text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
            onClick={async () => {
              await signOutUser();
              router.replace('/giris');
            }}
            type="button"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Çıkış yap
          </button>
        </div>

        {profileFound === false ? (
          <p className="mt-8 rounded-2xl bg-primary/5 px-5 py-4 text-sm leading-6 text-muted-foreground">
            Mobil uygulamadaki profil kaydın henüz oluşmamış. Telefon hesabın
            açık; profil bilgilerin oluştuğunda burada görünecek.
          </p>
        ) : null}
        {profileError || authError ? (
          <p
            className="mt-8 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700"
            role="alert"
          >
            {profileError || authError}
          </p>
        ) : null}

        {facts.length ? (
          <dl className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
            {facts.map(([label, value]) => (
              <div className="bg-background p-5" key={label}>
                <dt className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">
                  {label}
                </dt>
                <dd className="mt-2 text-base font-bold text-foreground">
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        ) : null}

        <div className="mt-8 flex flex-col gap-3 rounded-2xl bg-primary px-5 py-5 text-primary-foreground sm:flex-row sm:items-center sm:justify-between">
          <div>
            <strong className="block text-lg">Hazırlığını tamamla</strong>
            <span className="text-sm text-primary-foreground/75">
              Web araçlarını tek yerde incele.
            </span>
          </div>
          <Link
            className="inline-flex items-center gap-2 self-start rounded-full bg-white px-5 py-3 text-sm font-bold text-primary sm:self-auto"
            href="/araclar"
          >
            Hazırlık listeme git{' '}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </div>
  );
}
