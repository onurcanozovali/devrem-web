import { sitemapXml, xmlResponse } from '@/lib/seo/xml';
import {
  listIndexableMilitaryUnits,
  unitLastModified,
} from '@/lib/military-units';
import { pageSitemapEntries } from '@/src/config/seo-routes';

export const dynamic = 'force-dynamic';

export async function GET() {
  const units = await listIndexableMilitaryUnits();
  const entries = [...pageSitemapEntries];

  if (units.length) {
    const latestUnitDate = units
      .map(unitLastModified)
      .sort((a, b) => b.localeCompare(a))[0];
    entries.push({ path: '/birlikler', lastModified: latestUnitDate });

    const cities = new Map<string, { count: number; lastModified: string }>();
    for (const unit of units) {
      const lastModified = unitLastModified(unit);
      const current = cities.get(unit.citySlug);
      cities.set(unit.citySlug, {
        count: (current?.count ?? 0) + 1,
        lastModified:
          !current || lastModified > current.lastModified
            ? lastModified
            : current.lastModified,
      });
      entries.push({
        path: `/birlikler/${unit.citySlug}/${unit.slug}`,
        lastModified,
      });
    }

    for (const [citySlug, city] of cities) {
      if (city.count >= 2) {
        entries.push({
          path: `/birlikler/${citySlug}`,
          lastModified: city.lastModified,
        });
      }
    }
  }

  const uniqueEntries = Array.from(
    new Map(entries.map((entry) => [entry.path, entry])).values(),
  );
  return xmlResponse(sitemapXml(uniqueEntries));
}
