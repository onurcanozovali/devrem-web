'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { MilitaryUnitFixture } from '@/src/fixtures/home';
import { MilitaryUnitCard } from './military-unit-card';

export function MilitaryUnitSearch({
  units,
}: {
  units: MilitaryUnitFixture[];
}) {
  const [query, setQuery] = useState('');
  const filteredUnits = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('tr-TR');
    if (!normalized) return units;
    return units.filter((unit) =>
      `${unit.name} ${unit.city} ${unit.force}`
        .toLocaleLowerCase('tr-TR')
        .includes(normalized),
    );
  }, [query, units]);

  return (
    <div className="unit-search-panel">
      <label className="unit-search-input" htmlFor="military-unit-search">
        <Search
          className="size-5 shrink-0 text-primary-ink"
          aria-hidden="true"
        />
        <input
          aria-label="Birlik adı veya şehir ara"
          className="h-12 min-w-0 flex-1 border-0 bg-transparent px-0 text-base outline-none placeholder:text-secondary-foreground focus-visible:ring-0"
          id="military-unit-search"
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Birlik adı veya şehir ara"
          type="search"
          value={query}
        />
      </label>
      <div className="grid gap-3 p-3 sm:grid-cols-2 sm:p-4">
        {filteredUnits.length ? (
          filteredUnits.map((unit) => (
            <MilitaryUnitCard key={unit.id} unit={unit} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-sm font-semibold">Sonuç bulunamadı.</p>
          </div>
        )}
      </div>
    </div>
  );
}
