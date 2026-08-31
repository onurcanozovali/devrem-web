import Link from 'next/link';
import { ArrowUpRight, Calculator, CalendarClock, ListChecks, MapPinned } from 'lucide-react';
import { tools, type ToolFixture } from '@/src/fixtures/home';
import { Container } from '@/components/site/container';
import { SectionHeader } from './section-header';

const icons = {
  countdown: CalendarClock,
  calculator: Calculator,
  checklist: ListChecks,
  unit: MapPinned,
} as const;

function ToolCard({ tool }: { tool: ToolFixture }) {
  const Icon = icons[tool.icon];
  return (
    <Link className={`tool-card tool-card-${tool.accent} group`} href={tool.href}>
      <div className="flex items-start justify-between gap-4">
        <span className="tool-card-icon"><Icon className="size-6" aria-hidden="true" /></span>
        <ArrowUpRight className="size-5 opacity-45 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" aria-hidden="true" />
      </div>
      <h3 className="mt-10 text-xl font-bold tracking-[-0.035em]">{tool.title}</h3>
      <p className="mt-3 text-sm leading-6 text-secondary-foreground">{tool.description}</p>
      <p className="mt-7 text-xs font-bold text-primary-ink">İlgili önizlemeye git</p>
    </Link>
  );
}

export function ToolsGrid() {
  return (
    <section className="bg-surface py-20 sm:py-24 lg:py-28" id="araclar">
      <Container>
        <SectionHeader eyebrow="Devrem araçları" title="Askere hazırlanırken işine yarayacak araçlar" description="Hesaplama, hazırlık ve birlik araştırması için tek bir düzenli başlangıç noktası." />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{tools.map((tool) => <ToolCard key={tool.title} tool={tool} />)}</div>
      </Container>
    </section>
  );
}
