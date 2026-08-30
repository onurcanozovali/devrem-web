import { ArrowUpRight, CalendarDays } from 'lucide-react';
import { militaryUpdates } from '@/src/fixtures/home';
import { Container } from '@/components/site/container';
import { SectionHeader } from './section-header';

export function MilitaryUpdates() {
  return (
    <section className="bg-surface py-20 sm:py-24" id="gundem">
      <Container>
        <SectionHeader eyebrow="Zamana duyarlı içerik" title="Askerlik gündemi" description="Resmî duyurular, bedelli güncellemeleri ve sevk takvimi için hazırlanmış ayrı içerik akışı." />
        <div className="updates-list mt-10">
          {militaryUpdates.map((item, index) => (
            <article className="news-row group" key={item.title}>
              <span className="news-index">{String(index + 1).padStart(2, '0')}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-3"><span className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary">{item.category}</span><span className="rounded-full bg-warning/10 px-2 py-1 text-[8px] font-bold text-warning">DEMO İÇERİK</span></div>
                <h3 className="mt-2 text-base font-bold tracking-[-0.02em] sm:text-lg">{item.title}</h3>
              </div>
              <div className="flex shrink-0 items-center gap-2 text-[10px] font-semibold text-secondary-foreground"><CalendarDays className="size-3.5" aria-hidden="true" /><span className="hidden sm:inline">{item.date}</span></div>
              <ArrowUpRight className="size-4 shrink-0 text-primary opacity-50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
            </article>
          ))}
        </div>
        <p className="mt-4 text-xs leading-5 text-secondary-foreground">Bu başlıklar ve tarihler yalnızca Stage 1 arayüz fikstürleridir; gerçek haber veya resmî duyuru olarak sunulmaz.</p>
      </Container>
    </section>
  );
}
