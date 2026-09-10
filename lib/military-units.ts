import { cache } from 'react';
import { queryFirestoreDocuments } from '@/lib/firebase/server';

type RecordData = Record<string, unknown>;

export type PublicMilitaryUnit = {
  id: string;
  name: string;
  shortName: string | null;
  city: string;
  citySlug: string;
  district: string | null;
  force: string;
  unitType: string | null;
  audience: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  mapSourceUrl: string | null;
  transportation: string | null;
  transportationMethods: Array<{ label: string; value: string }>;
  introduction: string | null;
  verifiedFacts: string[];
  joiningNotes: string | null;
  preparationNotes: string | null;
  facilities: Array<{
    label: string;
    status: 'reported' | 'verified';
    note: string | null;
  }>;
  verificationStatus: 'verified';
  sourceLabel: string | null;
  sourceUrl: string | null;
  sources: Array<{ title: string | null; url: string | null }>;
  seoTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
  slug: string;
  legacySlugs: string[];
};

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function stringList(value: unknown) {
  return Array.isArray(value)
    ? value.flatMap((item) => (stringValue(item) ? [stringValue(item)!] : []))
    : [];
}

export function slugifyUnit(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .toLocaleLowerCase('tr-TR')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function dateValue(value: unknown) {
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) {
    return new Date(value).toISOString();
  }
  if (value && typeof value === 'object') {
    const record = value as RecordData;
    const seconds = numberValue(record.seconds) ?? numberValue(record._seconds);
    if (seconds !== null) return new Date(seconds * 1000).toISOString();
  }
  return null;
}

function isPublished(data: RecordData) {
  const published = (
    data.isPublished === true ||
    ['published', 'active'].includes(
      stringValue(data.publicationStatus ?? data.status)?.toLowerCase() ?? '',
    )
  );
  return published && data.indexable === true;
}

function isVerified(data: RecordData) {
  return (
    data.verified === true ||
    ['verified', 'approved'].includes(
      stringValue(data.verificationStatus)?.toLowerCase() ?? '',
    )
  );
}

function mapUnit(id: string, data: RecordData): PublicMilitaryUnit | null {
  const name = stringValue(data.name) ?? stringValue(data.unitName);
  const city = stringValue(data.city) ?? stringValue(data.cityName);
  const force = stringValue(data.force) ?? stringValue(data.forceName);
  const updatedAt = dateValue(data.updatedAt);

  if (!name || !city || !force || !updatedAt || !isPublished(data) || !isVerified(data)) {
    return null;
  }

  const district = stringValue(data.district) ?? stringValue(data.districtName);
  const address = stringValue(data.address) ?? stringValue(data.location);
  const transportation = stringValue(data.transportation) ?? stringValue(data.howToGetThere);
  const transportationData = data.transportation && typeof data.transportation === 'object'
    ? data.transportation as RecordData
    : {};
  const transportationMethods = [
    ['Otogardan ulaşım', transportationData.busStation],
    ['Havalimanından ulaşım', transportationData.airport],
    ['Tren garından ulaşım', transportationData.trainStation],
    ['Şehir merkezinden ulaşım', transportationData.cityCenter],
    ['Genel ulaşım notu', transportationData.general ?? transportation],
  ].flatMap(([label, value]) => stringValue(value) ? [{ label: String(label), value: stringValue(value)! }] : []);
  const sources = Array.isArray(data.sources)
    ? data.sources.flatMap((item) => {
        const source = item && typeof item === 'object' ? item as RecordData : {};
        const title = stringValue(source.title);
        const url = stringValue(source.url);
        return title || url ? [{ title, url }] : [];
      })
    : [];
  const sourceLabel = sources[0]?.title ?? stringValue(data.sourceLabel) ?? stringValue(data.source);
  const sourceUrl = sources[0]?.url ?? stringValue(data.sourceUrl);
  const verifiedFacts = stringList(data.verifiedFacts ?? data.facts);
  const facilityData = data.facilities && typeof data.facilities === 'object'
    ? data.facilities as RecordData
    : {};
  const facilityLabels: Array<[string, string]> = [
    ['canteen', 'Kantin'], ['infirmary', 'Revir'], ['atm', 'ATM'],
    ['barber', 'Berber'], ['diningHall', 'Yemekhane'], ['communication', 'Telefon / iletişim'],
  ];
  const facilities = facilityLabels.flatMap(([key, label]) => {
    const value = facilityData[key] && typeof facilityData[key] === 'object'
      ? facilityData[key] as RecordData
      : {};
    const status = stringValue(value.status);
    if (status !== 'verified' && status !== 'reported') return [];
    return [{
      label,
      status: status as 'verified' | 'reported',
      note: stringValue(value.note),
    }];
  });
  if (Array.isArray(data.otherFacilities)) {
    for (const item of data.otherFacilities) {
      const value = item && typeof item === 'object' ? item as RecordData : {};
      const status = stringValue(value.status);
      const note = stringValue(value.note);
      if ((status === 'verified' || status === 'reported') && note) {
        facilities.push({
          label: note,
          status: status as 'verified' | 'reported',
          note: null,
        });
      }
    }
  }

  // Identity alone is not enough for an indexable SEO page.
  if (!district || (!address && transportationMethods.length === 0 && verifiedFacts.length === 0)) return null;

  const slug = slugifyUnit(stringValue(data.slug) ?? name);
  const citySlug = slugifyUnit(city);
  if (!slug || !citySlug) return null;

  return {
    id,
    name,
    shortName: stringValue(data.shortName),
    city,
    citySlug,
    district,
    force,
    unitType: stringValue(data.unitType) ?? stringValue(data.type),
    audience: stringList(data.audiences).join(', ') || stringValue(data.audience),
    address,
    latitude: numberValue(data.latitude) ?? numberValue((data.coordinates as RecordData | undefined)?.latitude),
    longitude: numberValue(data.longitude) ?? numberValue((data.coordinates as RecordData | undefined)?.longitude),
    mapSourceUrl: stringValue(data.mapSourceUrl),
    transportation: transportationMethods[0]?.value ?? null,
    transportationMethods,
    introduction: stringValue(data.introduction ?? data.about),
    verifiedFacts,
    joiningNotes: stringValue(data.joiningNotes),
    preparationNotes: stringValue(data.preparationNotes),
    facilities,
    verificationStatus: 'verified',
    sourceLabel,
    sourceUrl,
    sources: sources.length ? sources : (sourceLabel || sourceUrl ? [{ title: sourceLabel, url: sourceUrl }] : []),
    seoTitle: stringValue(data.seoTitle),
    metaDescription: stringValue(data.metaDescription),
    updatedAt,
    slug,
    legacySlugs: stringList(data.legacySlugs ?? data.slugHistory)
      .map(slugifyUnit)
      .filter((item) => item !== slug),
  };
}

export const listIndexableMilitaryUnits = cache(async () => {
  const result = await queryFirestoreDocuments({
    collection: '_adminMilitaryUnits',
    limit: 100,
  }).catch(() => ({ records: [], nextCursor: null }));

  return result.records
    .flatMap(({ id, data }) => {
      const unit = mapUnit(id, data);
      return unit ? [unit] : [];
    })
    .sort((a, b) => {
      const qualityA = Number(Boolean(a.transportation)) + Number(Boolean(a.address)) + a.verifiedFacts.length;
      const qualityB = Number(Boolean(b.transportation)) + Number(Boolean(b.address)) + b.verifiedFacts.length;
      return qualityB - qualityA || a.name.localeCompare(b.name, 'tr');
    })
    .slice(0, 20);
});

export async function getMilitaryUnitCity(citySlug: string) {
  const units = (await listIndexableMilitaryUnits()).filter(
    (unit) => unit.citySlug === citySlug,
  );
  return units.length >= 2 ? { city: units[0].city, units } : null;
}

export async function resolveMilitaryUnitRoute(citySlug: string, unitSlug: string) {
  const units = await listIndexableMilitaryUnits();
  const unit = units.find(
    (item) =>
      item.citySlug === citySlug &&
      (item.slug === unitSlug || item.legacySlugs.includes(unitSlug)),
  );
  if (!unit) return null;
  return {
    unit,
    canonicalPath: `/birlikler/${unit.citySlug}/${unit.slug}`,
    isCanonical: unit.slug === unitSlug,
  };
}

export function unitLastModified(unit: PublicMilitaryUnit) {
  return unit.updatedAt.slice(0, 10);
}
