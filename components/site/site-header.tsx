'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, Menu } from 'lucide-react';
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
  const desktopGuideMenu = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const closeDesktopMenus = (event: PointerEvent) => {
      for (const menu of [desktopGuideMenu.current]) {
        if (
          menu?.open &&
          event.target instanceof Node &&
          !menu.contains(event.target)
        ) {
          menu.removeAttribute('open');
        }
      }
    };

    const closeDesktopMenusWithEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        desktopGuideMenu.current?.removeAttribute('open');
      }
    };

    document.addEventListener('pointerdown', closeDesktopMenus);
    document.addEventListener('keydown', closeDesktopMenusWithEscape);

    return () => {
      document.removeEventListener('pointerdown', closeDesktopMenus);
      document.removeEventListener('keydown', closeDesktopMenusWithEscape);
    };
  }, []);

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
            {mainNavigation.map((item) =>
              'items' in item ? (
                <details
                  className="header-guide-menu"
                  key={item.label}
                  ref={desktopGuideMenu}
                >
                  <summary className="nav-link">
                    {item.label} <ChevronDown aria-hidden="true" />
                  </summary>
                  <div className="header-guide-dropdown">
                    {item.items.map((child) => (
                      <Link href={child.href} key={child.href}>
                        <strong>{child.label}</strong>
                        <small>{child.description}</small>
                      </Link>
                    ))}
                  </div>
                </details>
              ) : (
                <Link
                  className="nav-link"
                  href={item.href}
                  key={item.href}
                  tabIndex={desktopSearchOpen ? -1 : undefined}
                >
                  {item.label}
                </Link>
              ),
            )}
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
            className="mobile-menu-panel w-full gap-0 overflow-y-auto overscroll-contain border-x-0 border-t-0 bg-background p-0"
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
                    {mainNavigation.map((item, index) =>
                      'items' in item ? (
                        <details className="mobile-guide-menu" key={item.label}>
                          <summary className="mobile-menu-link">
                            <span className="mobile-menu-index">
                              0{index + 1}
                            </span>
                            <span className="mobile-menu-link-copy">
                              <strong>{item.label}</strong>
                            </span>
                            <ChevronDown
                              className="size-5"
                              aria-hidden="true"
                            />
                          </summary>
                          <div>
                            {item.items.map((child) => (
                              <Link
                                href={child.href}
                                key={child.href}
                                onClick={() => setMobileOpen(false)}
                              >
                                <strong>{child.label}</strong>
                                <ArrowRight aria-hidden="true" />
                              </Link>
                            ))}
                          </div>
                        </details>
                      ) : (
                        <Link
                          className="mobile-menu-link group"
                          href={item.href}
                          key={item.href}
                          onClick={() => setMobileOpen(false)}
                        >
                          <span className="mobile-menu-index">
                            0{index + 1}
                          </span>
                          <span className="mobile-menu-link-copy">
                            <strong>{item.label}</strong>
                          </span>
                          <ArrowRight className="size-5" aria-hidden="true" />
                        </Link>
                      ),
                    )}
                  </nav>
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
