'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, MapPin, Search } from 'lucide-react';
import type { PublicMilitaryUnit } from '@/lib/military-units';

export function MilitaryUnitDirectory({ units }: { units: PublicMilitaryUnit[] }) {
  const [query, setQuery] = useState('');
  const [force, setForce] = useState('Tümü');
  const forces = useMemo(
    () => ['Tümü', ...Array.from(new Set(units.map((unit) => unit.force))).sort((a, b) => a.localeCompare(b, 'tr'))],
    [units],
  );
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    return units.filter((unit) => {
      const matchesForce = force === 'Tümü' || unit.force === force;
      const haystack = `${unit.name} ${unit.shortName ?? ''} ${unit.aliases.join(' ')} ${unit.city} ${unit.district ?? ''}`.toLocaleLowerCase('tr-TR');
      return matchesForce && (!normalized || haystack.includes(normalized));
    });
  }, [force, query, units]);

  return (
    <section className="mt-10" aria-labelledby="unit-directory-title">
      <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl" id="unit-directory-title">
        Birlik rehberi
      </h2>
      <div className="mt-5 grid gap-3 rounded-3xl border border-border bg-surface p-4 shadow-sm lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-border bg-background px-4">
          <Search className="size-5 shrink-0 text-primary" aria-hidden="true" />
          <span className="sr-only">Şehir veya birlik ara</span>
          <input
            className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-secondary-foreground"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Şehir veya birlik ara"
            type="search"
            value={query}
          />
        </label>
        <div className="flex max-w-full gap-2 overflow-x-auto pb-1" aria-label="Kuvvete göre filtrele">
          {forces.map((item) => (
            <button
              aria-pressed={force === item}
              className={`shrink-0 rounded-full border px-4 py-2 text-sm font-bold transition ${force === item ? 'border-primary bg-primary text-white' : 'border-border bg-background hover:border-primary/40'}`}
              key={item}
              onClick={() => setForce(item)}
              type="button"
            >
              {item}
            </button>
          ))}
        </div>
      </div>

      {filtered.length ? (
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {filtered.map((unit) => (
            <Link
              className="group rounded-3xl border border-border bg-surface p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-md"
              href={`/birlikler/${unit.citySlug}/${unit.slug}`}
              key={unit.id}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.12em] text-primary">{unit.force}</p>
                  <h3 className="mt-2 text-lg font-extrabold leading-snug">{unit.shortName ?? unit.name}</h3>
                  <p className="mt-3 flex items-center gap-2 text-sm text-secondary-foreground">
                    <MapPin className="size-4 text-primary" aria-hidden="true" />
                    {unit.city}{unit.district ? ` · ${unit.district}` : ''}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-5 shrink-0 text-primary transition group-hover:translate-x-1" aria-hidden="true" />
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="mt-5 rounded-3xl border border-dashed border-border p-8 text-center text-secondary-foreground">
          Bu aramayla eşleşen yayınlanmış birlik bulunamadı.
        </div>
      )}
    </section>
  );
}
