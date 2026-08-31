'use client';

import Link from 'next/link';
import { Menu } from 'lucide-react';
import { mainNavigation } from '@/src/config/site';
import { Container } from '@/components/site/container';
import { SiteLogo } from '@/components/site/site-logo';
import { StoreButtons } from '@/components/site/store-buttons';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function SiteHeader() {
  return (
    <header className="site-header sticky top-0 z-40 border-b border-transparent bg-background/88 backdrop-blur-xl">
      <Container className="flex h-[72px] items-center justify-between gap-5 xl:h-20">
        <SiteLogo />
        <nav
          aria-label="Ana menü"
          className="hidden items-center gap-1 xl:flex"
        >
          {mainNavigation.map((item) => (
            <Link className="nav-link" href={item.href} key={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>
        <StoreButtons className="hidden xl:flex" compact showStatus={false} />

        <Sheet>
          <SheetTrigger
            aria-label="Menüyü aç"
            className="flex size-11 items-center justify-center rounded-full border border-border bg-surface text-foreground shadow-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/30 xl:hidden"
          >
            <Menu className="size-5" aria-hidden="true" />
          </SheetTrigger>
          <SheetContent
            className="w-[min(88vw,390px)] border-border bg-background p-0"
            side="right"
          >
            <SheetHeader className="border-b border-border p-6 text-left">
              <SiteLogo />
              <SheetTitle className="sr-only">Devrem menüsü</SheetTitle>
              <SheetDescription className="sr-only">
                Devrem platformu bölümleri
              </SheetDescription>
            </SheetHeader>
            <nav aria-label="Mobil menü" className="flex flex-col gap-1 p-5">
              {mainNavigation.map((item) => (
                <SheetClose
                  key={item.href}
                  nativeButton={false}
                  render={
                    <Link
                      className="rounded-2xl px-4 py-3.5 text-base font-semibold text-foreground transition hover:bg-primary-subtle focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/25"
                      href={item.href}
                    />
                  }
                >
                  {item.label}
                </SheetClose>
              ))}
            </nav>
            <div className="mt-auto border-t border-border p-5">
              <p className="mb-4 text-xs font-bold uppercase tracking-[0.1em] text-primary-ink">
                Devrem&apos;i indir
              </p>
              <StoreButtons />
            </div>
          </SheetContent>
        </Sheet>
      </Container>
    </header>
  );
}
