import { ArrowUpRight, MapPin } from 'lucide-react';
import type { MilitaryUnitFixture } from '@/src/fixtures/home';

export function MilitaryUnitCard({ unit }: { unit: MilitaryUnitFixture }) {
  return (
    <article className="unit-card group">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-[0.9rem] bg-primary-subtle text-primary-ink">
        <MapPin className="size-5" aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        <h3 className="text-sm font-bold leading-5 text-foreground">
          {unit.name}
        </h3>
        <p className="mt-1 text-xs text-secondary-foreground">
          {unit.city} · {unit.force}
        </p>
      </div>
      <div className="flex flex-col items-end gap-2">
        <ArrowUpRight
          className="size-4 text-primary-ink opacity-60 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </div>
    </article>
  );
}
