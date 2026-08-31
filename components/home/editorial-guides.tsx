import { BookOpen, Clock3, FileText, Smartphone, Sparkles } from 'lucide-react';
import { guides, type EditorialFixture } from '@/src/fixtures/home';
import { Container } from '@/components/site/container';
import { SectionHeader } from './section-header';

const toneIcons = {
  mint: Sparkles,
  sage: FileText,
  amber: Clock3,
  charcoal: BookOpen,
  sand: Smartphone,
  rose: FileText,
} as const;

function GuideCard({ guide, featured = false }: { guide: EditorialFixture; featured?: boolean }) {
  const Icon = toneIcons[guide.tone];
  return (
    <article className={`guide-card guide-tone-${guide.tone} ${featured ? 'guide-card-featured' : ''}`}>
      <div className="guide-visual" aria-hidden="true">
        <span className="guide-visual-icon"><Icon className="size-7" /></span>
        <span className="guide-visual-line guide-visual-line-a" />
        <span className="guide-visual-line guide-visual-line-b" />
        <span className="guide-visual-dot" />
      </div>
      <div className="guide-content">
        <div className="flex flex-wrap items-center gap-3">
          <span className="rounded-full bg-primary-subtle px-2.5 py-1 text-[10px] font-bold text-primary-ink">{guide.category}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-secondary-foreground"><Clock3 className="size-3" aria-hidden="true" /> {guide.readingTime}</span>
          <span className="ml-auto text-[9px] font-bold uppercase tracking-[0.08em] text-secondary-foreground">İçerik demosu</span>
        </div>
        <h3 className={`${featured ? 'mt-6 text-3xl sm:text-4xl' : 'mt-5 text-lg'} font-bold leading-tight tracking-[-0.045em]`}>{guide.title}</h3>
        <p className={`${featured ? 'mt-4 max-w-xl text-base leading-7' : 'mt-3 text-sm leading-6'} text-secondary-foreground`}>{guide.excerpt}</p>
        <p className="mt-6 text-xs font-bold text-primary-ink">Detay sayfası sonraki aşamada</p>
      </div>
    </article>
  );
}

export function EditorialGuides() {
  const [featured, ...rest] = guides;
  return (
    <section className="py-20 sm:py-24 lg:py-28" id="rehberler">
      <Container>
        <SectionHeader eyebrow="Rehberler" title="Askere gitmeden önce bilmen gerekenler" description="Zamana duyarlı haberlerden ayrı, hazırlık sürecinin temel sorularına odaklanan güncellenebilir içerik yapısı." />
        <div className="mt-10 grid gap-5 lg:grid-cols-[1.12fr_0.88fr]">
          <GuideCard featured guide={featured} />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">{rest.slice(0, 2).map((guide) => <GuideCard guide={guide} key={guide.title} />)}</div>
        </div>
        <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{rest.slice(2).map((guide) => <GuideCard guide={guide} key={guide.title} />)}</div>
      </Container>
    </section>
  );
}
