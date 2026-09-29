'use client';

import { useState, useSyncExternalStore } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const noticeStorageKey = 'devrem_cookie_notice_dismissed_v2';
const noticeChangeEvent = 'devrem:cookie-notice';

function subscribeToConsent(onStoreChange: () => void) {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener(noticeChangeEvent, onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(noticeChangeEvent, onStoreChange);
  };
}

function needsCookieNotice() {
  try {
    return window.localStorage.getItem(noticeStorageKey) !== 'dismissed';
  } catch {
    return true;
  }
}

export function CookieNotice() {
  const [dismissedForSession, setDismissedForSession] = useState(false);
  const needsNotice = useSyncExternalStore(
    subscribeToConsent,
    needsCookieNotice,
    () => false,
  );

  function dismissNotice() {
    try {
      window.localStorage.setItem(noticeStorageKey, 'dismissed');
    } catch {}
    setDismissedForSession(true);
    window.dispatchEvent(new Event(noticeChangeEvent));
  }

  if (!needsNotice || dismissedForSession) return null;

  return (
    <section
      className="cookie-notice-shell"
      aria-label="Çerez bilgilendirmesi"
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
            Devrem, sitenin çalışması ve kullanımın anlaşılması için çerezler
            kullanabilir. Bu bildirim reklam izni yerine geçmez.{' '}
            <Link
              className="font-semibold text-primary-ink underline decoration-primary/40 underline-offset-3 transition hover:text-primary-dark"
              href="/cerez-politikasi"
            >
              Çerez Politikası
            </Link>
          </p>
        </div>
        <Button
          className="h-9 shrink-0 rounded-full bg-primary px-4 font-bold text-primary-foreground hover:bg-primary-hover"
          onClick={dismissNotice}
          type="button"
        >
          Kapat
        </Button>
      </div>
    </section>
  );
}
