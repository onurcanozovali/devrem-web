import type { Metadata } from 'next';
import Link from 'next/link';
import {
  ArrowDown,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { BedelliCalculator } from '@/components/bedelli/bedelli-calculator';
import { Container } from '@/components/site/container';
import { JsonLd } from '@/components/seo/json-ld';
import { getDailyMarketSnapshot } from '@/lib/evds';
import {
  breadcrumbSchema,
  graphSchema,
  webPageSchema,
} from '@/lib/seo/structured-data';
import { createPageMetadata } from '@/src/config/seo';
import {
  bedelliPageCopy,
  bedelliSources,
} from '@/src/content/bedelli';
import { currentBedelliPeriod } from '@/src/fixtures/bedelli';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = createPageMetadata({
  title: '2026 Bedelli Askerlik Ücreti Ne Kadar?',
  description:
    '2026 bedelli askerlik ücretini, yıllara göre değişimini, gram altın, euro ve net asgari ücret karşılığını resmî verilerle karşılaştır.',
  path: '/bedelli',
  imageAlt: 'Devrem 2026 bedelli askerlik ücreti karşılaştırması',
});

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});

const structuredData = graphSchema(
  webPageSchema({
    path: '/bedelli',
    name: '2026 Bedelli Askerlik Ücreti Ne Kadar?',
    description:
      '2026 bedelli askerlik ücreti ve yıllara göre alım gücü karşılaştırması.',
    dateModified: bedelliSources.currentFee.updatedAt,
  }),
  breadcrumbSchema([
    { name: 'Ana Sayfa', path: '/' },
    { name: 'Bedelli Askerlik Ücreti', path: '/bedelli' },
  ]),
);

export default async function BedelliPage() {
  let snapshot = null;

  try {
    snapshot = await getDailyMarketSnapshot();
  } catch {
    snapshot = null;
  }

  return (
    <main className="bedelli-page" id="ana-icerik">
      <JsonLd data={structuredData} />
      <Container>
        <nav className="bedelli-breadcrumb" aria-label="Sayfa yolu">
          <Link href="/">
            <ArrowLeft className="size-4" aria-hidden="true" /> Ana sayfa
          </Link>
          <span aria-hidden="true">/</span>
          <span>Bedelli askerlik ücreti</span>
        </nav>

        <section className="bedelli-hero" aria-labelledby="bedelli-title">
          <div className="bedelli-hero-copy">
            <p className="bedelli-kicker">Güncel resmî tutar</p>
            <h1 id="bedelli-title">2026 Bedelli Askerlik Ücreti</h1>
            <p className="bedelli-hero-value">
              {currency.format(currentBedelliPeriod.amount)}
            </p>
            <div className="bedelli-hero-period">
              <CheckCircle2 className="size-4" aria-hidden="true" />
              <span>{currentBedelliPeriod.label}</span>
              <span>7 Temmuz 2026’da güncellendi</span>
            </div>
            <p className="bedelli-hero-intro">{bedelliPageCopy.heroIntro}</p>
            <div className="bedelli-hero-actions">
              {snapshot ? (
                <>
                  <a href="#alim-gucu">
                    Satın alma gücünü karşılaştır{' '}
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </a>
                  <a className="is-secondary" href="#piyasa-grafigi">
                    Yıllara göre değişimi gör{' '}
                    <ArrowDown className="size-4" aria-hidden="true" />
                  </a>
                </>
              ) : (
                <a href="#veri-durumu">
                  Veri durumunu gör{' '}
                  <ArrowDown className="size-4" aria-hidden="true" />
                </a>
              )}
            </div>
          </div>
          <aside className="bedelli-hero-source" aria-label="Veri kaynağı">
            <span>Kaynağı belli, hesabı şeffaf</span>
            <strong>Resmî bedel + TCMB EVDS</strong>
            <p>
              Piyasa verileri günde bir kez alınır; tüm karşılıklar sayfada
              anında hesaplanır.
            </p>
            <a
              href={bedelliSources.currentFee.url}
              rel="noreferrer"
              target="_blank"
            >
              MSB duyurusunu gör{' '}
              <ExternalLink className="size-4" aria-hidden="true" />
            </a>
          </aside>
        </section>

        {snapshot ? (
          <BedelliCalculator snapshot={snapshot} />
        ) : (
          <section
            className="bedelli-data-error"
            id="veri-durumu"
            aria-live="polite"
          >
            <h2>Piyasa verisi şu anda alınamadı.</h2>
            <p>
              Güncel resmî bedel yukarıda görünür. Altın, döviz ve maaş
              karşılaştırmaları veri bağlantısı yenilendiğinde otomatik açılır.
            </p>
            <a
              href={bedelliSources.currentFee.url}
              rel="noreferrer"
              target="_blank"
            >
              MSB kaynağını aç
            </a>
          </section>
        )}
      </Container>
    </main>
  );
}
