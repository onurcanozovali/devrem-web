import type { Metadata } from 'next';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BedelliCalculator } from '@/components/bedelli/bedelli-calculator';
import { Container } from '@/components/site/container';
import { getDailyMarketSnapshot } from '@/lib/evds';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bedelli Askerlik Ücreti ve Karşılaştırma',
  description:
    'Bedelli askerlik ücretinin son beş yıldaki dolar, euro, gram altın ve yaklaşık çeyrek altın karşılığını karşılaştır.',
  alternates: { canonical: '/bedelli' },
  openGraph: {
    title: 'Bedelli Askerlik Ücreti ve Karşılaştırma | Devrem',
    description:
      'Bedelli askerlik ücretinin 2022–2026 arasındaki alım gücünü EVDS verileriyle karşılaştır.',
    images: [],
  },
  twitter: { card: 'summary', images: [] },
};

export default async function BedelliPage() {
  let snapshot = null;

  try {
    snapshot = await getDailyMarketSnapshot();
  } catch {
    snapshot = null;
  }

  return (
    <main className="bedelli-page" id="ana-icerik">
      <Container>
        <div className="bedelli-page-intro">
          <Link
            className="inline-flex items-center gap-2 text-xs font-bold text-secondary-foreground transition hover:text-primary-ink"
            href="/"
          >
            <ArrowLeft className="size-4" aria-hidden="true" /> Ana sayfa
          </Link>
          <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl">
              <h1 className="mt-4 text-[clamp(2.8rem,6vw,5.2rem)] font-extrabold leading-[0.93] tracking-[-0.075em]">
                Bedelli ücreti,
                <br />
                <span className="text-primary-ink">gerçekte ne kadar?</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-secondary-foreground">
                Sadece TL tutarına bakma. 2022’den bugüne beş resmî dönemi
                dolar, euro ve altın karşılığıyla karşılaştır.
              </p>
            </div>
          </div>
        </div>

        {snapshot ? (
          <BedelliCalculator snapshot={snapshot} />
        ) : (
          <section className="rounded-[2rem] border border-danger/25 bg-danger/5 p-8 sm:p-12">
            <h2 className="text-2xl font-bold">
              Piyasa verisi şu anda alınamadı.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary-foreground">
              Güncel resmî bedel için MSB kaynağını kullanabilirsin.
            </p>
          </section>
        )}
      </Container>
    </main>
  );
}
