'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Mail, Menu } from 'lucide-react';
import { BlogSearch } from '@/components/content/blog-search';
import { mainNavigation } from '@/src/config/site';
import { Container } from '@/components/site/container';
import { SiteLogo } from '@/components/site/site-logo';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function SiteHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSearching, setMobileSearching] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);
  const mobileScrollPosition = useRef(0);
  const mobileOpenLocation = useRef('');

  const rememberMobileScroll = () => {
    mobileScrollPosition.current = window.scrollY;
    mobileOpenLocation.current = window.location.href;
  };

  useEffect(() => {
    if (mobileOpen || !mobileOpenLocation.current) return;

    const restoreTimer = window.setTimeout(() => {
      if (window.location.href === mobileOpenLocation.current) {
        window.scrollTo({
          top: mobileScrollPosition.current,
          behavior: 'auto',
        });
      }
    }, 280);

    return () => window.clearTimeout(restoreTimer);
  }, [mobileOpen]);

  return (
    <header className="site-header sticky top-0 z-40 border-b border-transparent bg-background/88 backdrop-blur-xl">
      <Container className="flex h-[72px] items-center justify-between gap-5 xl:h-20">
        <SiteLogo />
        <div
          className={`header-desktop-shell hidden xl:flex ${desktopSearchOpen ? 'is-searching' : ''}`}
        >
          <nav
            aria-hidden={desktopSearchOpen}
            aria-label="Ana menü"
            className="header-desktop-nav"
          >
            {mainNavigation.map((item) => (
              <Link
                className="nav-link"
                href={item.href}
                key={item.href}
                tabIndex={desktopSearchOpen ? -1 : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <BlogSearch
            headerExpanded={desktopSearchOpen}
            onHeaderDismiss={() => setDesktopSearchOpen(false)}
            onHeaderExpand={() => setDesktopSearchOpen(true)}
            onResultSelect={() => setDesktopSearchOpen(false)}
            variant="header"
          />
        </div>

        <Sheet
          modal="trap-focus"
          open={mobileOpen}
          onOpenChange={(open) => {
            setMobileOpen(open);
            if (!open) setMobileSearching(false);
          }}
        >
          <SheetTrigger
            aria-label="Menüyü aç"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 xl:hidden"
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                rememberMobileScroll();
              }
            }}
            onPointerDown={rememberMobileScroll}
          >
            <Menu className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent
            className="mobile-menu-panel h-[100dvh] max-h-[100dvh] w-full gap-0 overflow-y-auto overscroll-contain border-0 bg-background p-0 shadow-none"
            side="top"
          >
            <SheetHeader className="mobile-menu-header min-h-[72px] flex-row items-center border-b border-border/80 px-5 py-4 text-left sm:px-8">
              <SiteLogo />
              <SheetTitle className="sr-only">Devrem menüsü</SheetTitle>
              <SheetDescription className="sr-only">
                Devrem platformu bölümleri
              </SheetDescription>
            </SheetHeader>
            <div className="mobile-menu-body flex min-h-0 flex-1 flex-col px-5 pb-6 pt-6 sm:px-8 sm:pb-8">
              {!mobileSearching ? (
                <div className="mobile-menu-intro">
                  <p>Devrem</p>
                  <strong>
                    Hazırlan, bilgiye ulaş,
                    <br /> devrelerinle tanış.
                  </strong>
                </div>
              ) : null}

              <BlogSearch
                className={mobileSearching ? 'is-searching' : ''}
                variant="mobile"
                onResultSelect={() => setMobileOpen(false)}
                onSearchStateChange={setMobileSearching}
              />

              {!mobileSearching ? (
                <>
                  <nav aria-label="Mobil menü" className="mobile-menu-nav">
                    {mainNavigation.map((item, index) => (
                      <Link
                        className="mobile-menu-link group"
                        href={item.href}
                        key={item.href}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="mobile-menu-index">0{index + 1}</span>
                        <span className="mobile-menu-link-copy">
                          <strong>{item.label}</strong>
                          <small>{item.description}</small>
                        </span>
                        <ArrowRight className="size-5" aria-hidden="true" />
                      </Link>
                    ))}
                  </nav>

                  <div className="mobile-menu-footer">
                    <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
                      <Link
                        href="/support"
                        onClick={() => setMobileOpen(false)}
                      >
                        Destek
                      </Link>
                      <Link
                        href="/privacy"
                        onClick={() => setMobileOpen(false)}
                      >
                        Gizlilik
                      </Link>
                    </div>
                    <a href="mailto:iletisim@devrem.co">
                      <Mail className="size-4" aria-hidden="true" />
                      iletisim@devrem.co
                    </a>
                  </div>
                </>
              ) : (
                <p className="mobile-search-hint">
                  İlgili rehbere gitmek için bir sonuç seç.
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
