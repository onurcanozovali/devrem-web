import { ArrowRight, CircleDollarSign, Coins, TrendingUp } from 'lucide-react';
import { bedelliOverview } from '@/src/fixtures/home';
import { ButtonLink } from '@/components/site/button-link';
import { Container } from '@/components/site/container';
import { SectionHeader } from './section-header';

export function BedelliOverview() {
  return (
    <section className="py-20 sm:py-24 lg:py-28" id="bedelli">
      <Container>
        <SectionHeader
          eyebrow="Karşılaştırma altyapısı"
          title="Bedelli askerlik"
          description="Dönemsel ücreti geçmiş yıllarla ve farklı ekonomik göstergelerle karşılaştırmaya hazır bir veri yüzeyi. Bu aşamadaki tüm rakamlar demodur."
        />
        <div className="mt-10 grid gap-5 lg:grid-cols-[0.85fr_1.15fr]">
          <article className="bedelli-price-card">
            <div className="flex items-start justify-between gap-5">
              <div><p className="text-xs font-bold uppercase tracking-[0.12em] text-primary-ink">Güncel ücret alanı</p><p className="mt-3 text-4xl font-bold tracking-[-0.055em] sm:text-5xl">{bedelliOverview.amount}</p><p className="mt-2 text-sm text-secondary-foreground">{bedelliOverview.period} · açıkça demo veri</p></div>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-primary-subtle text-primary-ink"><CircleDollarSign className="size-6" aria-hidden="true" /></span>
            </div>
            <div className="mt-8 flex items-center justify-between rounded-2xl bg-background px-4 py-3">
              <div><p className="text-[10px] uppercase tracking-[0.1em] text-secondary-foreground">Önceki döneme göre</p><p className="mt-1 text-sm font-bold">{bedelliOverview.change} <span className="font-medium text-secondary-foreground">örnek değişim</span></p></div>
              <TrendingUp className="size-5 text-success" aria-hidden="true" />
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {bedelliOverview.equivalents.map((item) => <div className="rounded-2xl border border-border p-3" key={item.label}><p className="text-[9px] leading-4 text-secondary-foreground">{item.label}</p><p className="mt-1 text-[11px] font-bold">{item.value}</p></div>)}
            </div>
          </article>

          <article className="bedelli-chart-card">
            <div className="flex items-start justify-between gap-4">
              <div><p className="text-sm font-bold">Tarihsel karşılaştırma</p><p className="mt-1 text-xs text-secondary-foreground">Yıllara göre endeks görünümü · demo</p></div>
              <span className="flex size-10 items-center justify-center rounded-xl bg-warning/10 text-warning"><Coins className="size-5" aria-hidden="true" /></span>
            </div>
            <figure className="chart-placeholder mt-10" aria-label="Demo tarihsel bedelli ücret grafiği">
              {bedelliOverview.history.map((value, index) => (
                <div className="chart-column" key={`${value}-${index}`}>
                  <div className="chart-bar" style={{ height: `${value}%` }}><span>{value}</span></div>
                  <p>{2020 + index}</p>
                </div>
              ))}
            </figure>
            <div className="mt-7 flex flex-col items-start justify-between gap-4 border-t border-border pt-5 sm:flex-row sm:items-center">
              <p className="max-w-md text-xs leading-5 text-secondary-foreground">Gelecekte TL, USD, EUR, gram altın ve diğer ekonomik göstergeler aynı veri modeli üzerinden karşılaştırılabilecek.</p>
              <ButtonLink href="#araclar" size="sm" variant="outline">Bedelli ücretlerini karşılaştır <ArrowRight aria-hidden="true" /></ButtonLink>
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
