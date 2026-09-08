'use client';

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Auth, User } from 'firebase/auth';

export type PublicFirebaseConfig = {
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
        const [{ getApps, initializeApp }, authModule] = await Promise.all([
          import('firebase/app'),
          import('firebase/auth'),
        ]);
        const app =
          getApps().find(
            (candidate) => candidate.name === USER_AUTH_APP_NAME,
          ) ?? initializeApp(config, USER_AUTH_APP_NAME);
        const nextAuth = authModule.getAuth(app);
        nextAuth.languageCode = 'tr';
        await authModule.setPersistence(
          nextAuth,
          authModule.browserLocalPersistence,
        );
        if (!active) return;
        setAuth(nextAuth);
        unsubscribe = authModule.onAuthStateChanged(nextAuth, (nextUser) => {
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
        if (auth) {
          const { signOut } = await import('firebase/auth');
          await signOut(auth);
        }
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
