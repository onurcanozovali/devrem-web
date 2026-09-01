import Link from 'next/link';
import { ArrowRight, BadgeTurkishLira, BarChart3 } from 'lucide-react';
import { Container } from '@/components/site/container';
import { getDailyMarketSnapshot } from '@/lib/evds';
import {
  currentBedelliPeriod,
  quarterGoldPureGrams,
} from '@/src/fixtures/bedelli';

const currency = new Intl.NumberFormat('tr-TR', {
  style: 'currency',
  currency: 'TRY',
  maximumFractionDigits: 2,
});
const decimal = new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 2 });

export async function BedelliTeaser() {
  let snapshot = null;
  try {
    snapshot = await getDailyMarketSnapshot();
  } catch {
    snapshot = null;
  }

  const equivalents = snapshot
    ? [
        {
          label: 'ABD doları',
          value: `${decimal.format(currentBedelliPeriod.amount / snapshot.current.usd.value)} USD`,
        },
        {
          label: 'Euro',
          value: `${decimal.format(currentBedelliPeriod.amount / snapshot.current.eur.value)} EUR`,
        },
        {
          label: 'Gram altın',
          value: `${decimal.format(currentBedelliPeriod.amount / snapshot.current.gold.value)} gr`,
        },
        {
          label: 'Çeyrek altın*',
          value: `≈ ${decimal.format(currentBedelliPeriod.amount / snapshot.current.gold.value / quarterGoldPureGrams)} adet`,
        },
      ]
    : [];

  return (
    <section
      className="py-20 sm:py-24"
      id="bedelli-ozet"
      aria-labelledby="bedelli-teaser-title"
    >
      <Container>
        <div className="bedelli-landing-card">
          <div className="relative z-10 max-w-xl">
            <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
              <BadgeTurkishLira className="size-6" aria-hidden="true" />
            </span>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.14em] text-primary-ink">
              Güncel Bedelli verisi
            </p>
            <h2
              className="mt-3 text-4xl font-bold leading-[1.02] tracking-[-0.06em] sm:text-5xl"
              id="bedelli-teaser-title"
            >
              Tutarı gör.
              <br />
              Karşılığını anla.
            </h2>
            <p className="mt-5 text-sm leading-7 text-secondary-foreground sm:text-base">
              Bugünkü resmî ücreti yalnızca TL olarak değil; 2022–2026
              arasındaki dolar, euro ve altın alım gücüyle birlikte incele.
            </p>
            <Link
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-bold text-background transition hover:-translate-y-0.5 hover:bg-primary-dark hover:text-white"
              href="/bedelli"
            >
              Bedelli karşılaştırmasını aç{' '}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="bedelli-landing-data">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-secondary-foreground">
                  01 Temmuz – 31 Aralık 2026
                </p>
                <p className="mt-3 text-[clamp(2.4rem,5vw,4.2rem)] font-extrabold leading-none tracking-[-0.065em]">
                  {currency.format(currentBedelliPeriod.amount)}
                </p>
              </div>
              <span className="flex items-center gap-2 rounded-full bg-primary-subtle px-3 py-2 text-[10px] font-bold text-primary-ink">
                <BarChart3 className="size-4" aria-hidden="true" /> 5 yıllık
                seri
              </span>
            </div>
            {equivalents.length ? (
              <div className="mt-8 grid grid-cols-2 gap-3">
                {equivalents.map((item) => (
                  <div
                    className="rounded-2xl border border-border bg-surface-elevated p-4"
                    key={item.label}
                  >
                    <p className="text-[10px] text-secondary-foreground">
                      {item.label}
                    </p>
                    <strong className="mt-2 block text-base tracking-[-0.03em]">
                      {item.value}
                    </strong>
                  </div>
                ))}
              </div>
            ) : (
              <div className="mt-8 rounded-2xl border border-border bg-surface-elevated p-5 text-sm text-secondary-foreground">
                Piyasa karşılıkları yenileniyor. Resmî TL tutarı ve beş yıllık
                sayfa kullanılabilir.
              </div>
            )}
            <p className="mt-5 text-[10px] leading-5 text-secondary-foreground">
              *Çeyrek altın değeri yaklaşık saf altın karşılığıdır; kuyumcu
              satış fiyatı değildir.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
