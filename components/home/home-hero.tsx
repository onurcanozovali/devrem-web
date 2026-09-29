import Link from 'next/link';
import {
  Building2,
  CalendarRange,
  Search,
  ShieldCheck,
  WalletCards,
} from 'lucide-react';
import { Container } from '@/components/site/container';
import { currentBedelliPeriod } from '@/src/fixtures/bedelli';

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

export function HomeHero() {
  return (
    <section className="platform-hero" aria-labelledby="home-hero-title">
      <Container className="grid items-center gap-12 py-16 sm:py-20 lg:min-h-[680px] lg:grid-cols-[1.08fr_0.92fr] lg:py-24">
        <div className="relative z-10 max-w-3xl">
          <p className="hero-kicker">
            <span aria-hidden="true" /> Türkiye&apos;nin askerlik bilgi platformu
          </p>
          <h1
            className="mt-7 max-w-3xl text-balance text-[clamp(3.35rem,7vw,6.6rem)] font-extrabold uppercase leading-[0.91] tracking-[-0.075em]"
            id="home-hero-title"
          >
            Askere hazırlığın <span className="text-primary-ink">tek yolu</span>
          </h1>
          <p className="mt-7 max-w-2xl text-base leading-8 text-secondary-foreground sm:text-xl sm:leading-9">
            Birliğini araştır, celp ve sevk tarihlerini takip et, bedelli
            askerlik ücretlerini karşılaştır ve askerliğe hazırlanırken ihtiyacın
            olan bilgilere tek yerden ulaş.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link className="platform-primary-button" href="/birlikler">
              Birliğini Bul
            </Link>
            <Link className="platform-secondary-button" href="/blog">
              Askerlik Rehberleri
            </Link>
          </div>

          <form action="/birlikler" className="platform-unit-search mt-8" method="get">
            <Search className="size-5 shrink-0 text-primary-ink" aria-hidden="true" />
            <label className="sr-only" htmlFor="hero-unit-search">
              Birlik adı veya şehir ara
            </label>
            <input
              id="hero-unit-search"
              name="ara"
              placeholder="Birlik adı veya şehir ara…"
              type="search"
            />
            <button type="submit">Ara</button>
          </form>
        </div>

        <div className="platform-hero-board" aria-label="Devrem bilgi alanları">
          <div className="platform-hero-board-head">
            <span>
              <ShieldCheck className="size-5" aria-hidden="true" /> Güncel bilgi
            </span>
            <small>Devrem</small>
          </div>
          <Link className="platform-hero-feature" href="/bedelli">
            <span className="platform-hero-feature-icon">
              <WalletCards className="size-6" aria-hidden="true" />
            </span>
            <div>
              <small>Güncel bedelli askerlik ücreti</small>
              <strong>{currency.format(currentBedelliPeriod.amount)}</strong>
              <p>{currentBedelliPeriod.label}</p>
            </div>
          </Link>
          <div className="grid gap-3 sm:grid-cols-2">
            <Link className="platform-hero-mini-card" href="/blog/2026-askerlik-celp-sevk-tarihleri">
              <CalendarRange className="size-5" aria-hidden="true" />
              <span>
                <small>Celp &amp; sevk</small>
                <strong>Güncel takvimi incele</strong>
              </span>
            </Link>
            <Link className="platform-hero-mini-card" href="/birlikler">
              <Building2 className="size-5" aria-hidden="true" />
              <span>
                <small>Birlik rehberi</small>
                <strong>Konum ve ulaşımı gör</strong>
              </span>
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
