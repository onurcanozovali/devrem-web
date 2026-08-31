import type { Metadata } from 'next';
import { ArrowLeft, BadgeTurkishLira, DatabaseZap } from 'lucide-react';
import Link from 'next/link';
import { BedelliCalculator } from '@/components/bedelli/bedelli-calculator';
import { Container } from '@/components/site/container';
import { getDailyMarketSnapshot } from '@/lib/evds';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Bedelli Askerlik Ücreti ve Karşılaştırma',
  description: 'Güncel bedelli askerlik ücretini dolar, euro, gram altın ve yaklaşık çeyrek altın karşılığıyla geçmiş yıl üzerinden karşılaştır.',
  alternates: { canonical: '/bedelli' },
  openGraph: {
    title: 'Bedelli Askerlik Ücreti ve Karşılaştırma | Devrem',
    description: 'Bedelli askerlik ücretinin bugünkü ve geçen yılki alım gücünü EVDS verileriyle karşılaştır.',
    images: [],
  },
  twitter: { card: 'summary', images: [] },
};

export default async function BedelliPage() {
  let snapshot = null;
  let dataError = false;

  try {
    snapshot = await getDailyMarketSnapshot();
  } catch {
    dataError = true;
  }

  return (
    <main className="bedelli-page" id="ana-icerik">
      <Container>
        <div className="bedelli-page-intro">
          <Link className="inline-flex items-center gap-2 text-xs font-bold text-secondary-foreground transition hover:text-primary-ink" href="/"><ArrowLeft className="size-4" aria-hidden="true" /> Ana sayfa</Link>
          <div className="mt-8 grid gap-7 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-4xl"><div className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-[10px] font-bold uppercase tracking-[0.1em] text-primary-ink"><BadgeTurkishLira className="size-4" aria-hidden="true" /> Bedelli karşılaştırma merkezi</div><h1 className="mt-4 text-[clamp(2.8rem,6vw,5.2rem)] font-extrabold leading-[0.93] tracking-[-0.075em]">Bedelli ücreti,<br /><span className="text-primary-ink">gerçekte ne kadar?</span></h1><p className="mt-5 max-w-2xl text-base leading-7 text-secondary-foreground">Sadece TL tutarına bakma. Bugünkü bedeli dolar, euro ve altın karşılığıyla incele; geçen yılın alım gücüyle kıyasla.</p></div>
            <div className="inline-flex w-fit items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-secondary-foreground"><span className="flex size-9 items-center justify-center rounded-xl bg-primary-subtle text-primary-ink"><DatabaseZap className="size-4" aria-hidden="true" /></span><span><strong className="block text-foreground">Günde tek EVDS çağrısı</strong>Sonuç 24 saat cache’lenir.</span></div>
          </div>
        </div>

        {snapshot ? <BedelliCalculator snapshot={snapshot} /> : (
          <section className="rounded-[2rem] border border-danger/25 bg-danger/5 p-8 sm:p-12">
            <h2 className="text-2xl font-bold">Piyasa verisi şu anda alınamadı.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-secondary-foreground">EVDS bağlantısı yenilenirken karşılaştırma alanını geçici olarak durdurduk. Güncel resmî bedel için MSB kaynağını kullanabilirsin.</p>
            {dataError ? <p className="mt-5 text-xs font-semibold text-danger">Veri bağlantısı tekrar denenecek.</p> : null}
          </section>
        )}
      </Container>
    </main>
  );
}
