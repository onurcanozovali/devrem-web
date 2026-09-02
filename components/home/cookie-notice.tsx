'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const consentStorageKey = 'devrem_cookie_notice_v1';
const consentChangeEvent = 'devrem:cookie-notice';

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(consentChangeEvent, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(consentChangeEvent, onStoreChange);
  };
}

function needsConsentNotice() {
  try {
    return window.localStorage.getItem(consentStorageKey) !== 'accepted';
  } catch {
    return true;
  }
}

export function CookieNotice() {
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const needsNotice = useSyncExternalStore(
    subscribeToConsent,
    needsConsentNotice,
    () => false,
  );

  function acceptNotice() {
    try {
      window.localStorage.setItem(consentStorageKey, 'accepted');
    } catch {}
    setDismissedForSession(true);
    window.dispatchEvent(new Event(consentChangeEvent));
  }

  if (!needsNotice || dismissedForSession) return null;

  return (
    <section
      className="cookie-notice-shell"
      aria-label="Çerez bildirimi"
      aria-live="polite"
    >
      <div className="cookie-notice-card">
        <div className="min-w-0 flex-1">
          <h2 className="flex items-center gap-2 text-[0.76rem] font-bold text-foreground">
            <span
              className="size-2 rounded-full bg-primary"
              aria-hidden="true"
            />
            Çerezler
          </h2>
          <p className="mt-1 text-[0.72rem] leading-5 text-secondary-foreground sm:text-[0.76rem]">
            Devrem, sitenin güvenli ve düzgün çalışması için gerekli çerezleri
            kullanır.{' '}
            <Link
              className="font-semibold text-primary-ink underline decoration-primary/40 underline-offset-3 transition hover:text-primary-dark"
              href="/privacy"
            >
              Gizlilik Politikası
            </Link>
          </p>
        </div>
        <Button
          className="h-9 shrink-0 rounded-full bg-primary px-4 font-bold text-primary-foreground hover:bg-primary-hover"
          onClick={acceptNotice}
          type="button"
        >
          Anladım
        </Button>
      </div>
    </section>
  );
}
