import { ArrowRight, BusFront, Info, TicketCheck } from 'lucide-react';
import { sponsoredPlacement } from '@/src/fixtures/home';
import { Container } from '@/components/site/container';

export function SponsoredPlacement() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <article className="sponsored-placement">
          <div className="sponsor-brand-placeholder" aria-hidden="true"><BusFront className="size-7" /></div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3"><p className="text-[10px] font-bold uppercase tracking-[0.12em] text-primary-ink">{sponsoredPlacement.eyebrow}</p><span className="rounded-full bg-warning/10 px-2 py-1 text-[8px] font-bold text-warning">AKTİF İŞ BİRLİĞİ DEĞİL</span></div>
            <h2 className="mt-3 text-2xl font-bold tracking-[-0.04em] sm:text-3xl">{sponsoredPlacement.title}</h2>
            <p className="mt-2 text-sm leading-6 text-secondary-foreground">{sponsoredPlacement.description}</p>
          </div>
          <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
            <button className="sponsor-demo-button" disabled type="button"><TicketCheck className="size-4" aria-hidden="true" /> Biletleri Gör <ArrowRight className="size-4" aria-hidden="true" /></button>
            <p className="flex items-center gap-1 text-[9px] text-secondary-foreground"><Info className="size-3" aria-hidden="true" /> {sponsoredPlacement.partnerName}</p>
          </div>
        </article>
      </Container>
    </section>
  );
}
