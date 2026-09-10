import { cache } from 'react';
import { queryFirestoreDocuments } from '@/lib/firebase/server';

type RecordData = Record<string, unknown>;
export type UnitFieldVerification = 'unknown' | 'reported' | 'verified';
export type UnitVerification = 'unverified' | 'reviewing' | 'partially_verified' | 'verified';

export type PublicMilitaryUnit = {
  id: string;
  name: string;
  shortName: string | null;
  aliases: string[];
  city: string;
  citySlug: string;
  district: string | null;
  force: string;
  unitType: string | null;
  audiences: string[];
  address: string | null;
  locationDescription: string | null;
  locationVerificationStatus: UnitFieldVerification;
  latitude: number | null;
  longitude: number | null;
  mapSourceUrl: string | null;
  mapStatus: 'query-only' | 'candidate' | 'verified';
  transportationMethods: UnitContent[];
  standfirst: string | null;
  introduction: string | null;
  highlights: string[];
  verifiedFacts: string[];
  joining: UnitContent[];
  preparationNotes: Omit<UnitContent, 'key' | 'label'> | null;
  preparationFacts: string[];
  facilities: Array<{
    label: string;
    availability: 'available' | 'unavailable';
    verificationStatus: UnitFieldVerification;
    note: string | null;
  }>;
  contact: { officialPhone: string | null; officialWebsite: string | null; note: string | null };
  faqs: Array<{
    id: string;
    question: string;
    answer: string;
    verificationStatus: UnitFieldVerification;
    sourceUrl: string | null;
  }>;
  verificationStatus: UnitVerification;
  verifiedAt: string | null;
  sources: Array<{
    title: string | null;
    url: string | null;
    type: 'official' | 'map' | 'institutional' | 'community' | 'other';
    accessedAt: string | null;
    note: string | null;
  }>;
  sourceNote: string | null;
  publicationStatus: 'draft' | 'published';
  indexable: boolean;
  seoTitle: string | null;
  metaDescription: string | null;
  ogImage: string | null;
  createdAt: string | null;
  updatedAt: string;
  slug: string;
  legacySlugs: string[];
};

type UnitContent = {
  key: string;
  label: string;
  value: string;
  verificationStatus: UnitFieldVerification;
  sourceUrl: string | null;
};

function recordValue(value: unknown): RecordData {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as RecordData : {};
}

function stringValue(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
}

function urlValue(value: unknown) {
  const candidate = stringValue(value);
  if (!candidate) return null;
  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
  } catch {
    return null;
  }
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
  if (typeof value === 'string' && !Number.isNaN(Date.parse(value))) return new Date(value).toISOString();
  const record = recordValue(value);
  const seconds = numberValue(record.seconds) ?? numberValue(record._seconds);
  return seconds !== null ? new Date(seconds * 1000).toISOString() : null;
}

function fieldVerification(value: unknown): UnitFieldVerification {
  const status = stringValue(value);
  return status === 'reported' || status === 'verified' ? status : 'unknown';
}

function globalVerification(data: RecordData): UnitVerification {
  const status = stringValue(data.verificationStatus);
  if (status === 'reviewing' || status === 'partially_verified' || status === 'verified') return status;
  return data.verified === true ? 'verified' : 'unverified';
}

function publicationStatus(data: RecordData): 'draft' | 'published' {
  const status = stringValue(data.publicationStatus ?? data.status)?.toLowerCase();
  return data.isPublished === true || status === 'published' || status === 'active' ? 'published' : 'draft';
}

function contentField(value: unknown, legacy?: unknown) {
  if (typeof value === 'string') {
    return { value: stringValue(value), verificationStatus: 'unknown' as const, sourceUrl: null };
  }
  const field = recordValue(value);
  return {
    value: stringValue(field.text) ?? stringValue(legacy),
    verificationStatus: fieldVerification(field.verificationStatus),
    sourceUrl: urlValue(field.sourceUrl),
  };
}

function identityString(data: RecordData, canonical: RecordData, ...keys: string[]) {
  for (const source of [canonical, data]) {
    for (const key of keys) {
      const value = stringValue(source[key]);
      if (value) return value;
    }
  }
  return null;
}

export function mapMilitaryUnitRecord(id: string, data: RecordData): PublicMilitaryUnit | null {
  const canonical = recordValue(data.canonicalIdentity);
  const name = identityString(data, canonical, 'name', 'unitName');
  const city = identityString(data, canonical, 'city', 'cityName');
  const force = identityString(data, canonical, 'force', 'forceName');
  const updatedAt = dateValue(data.updatedAt) ?? dateValue(data.createdAt);
  if (!name || !city || !force || !updatedAt) return null;

  const shortName = identityString(data, canonical, 'shortName');
  const district = identityString(data, canonical, 'district', 'districtName');
  const slug = slugifyUnit(stringValue(data.slug) ?? name);
  const citySlug = slugifyUnit(city);
  if (!slug || !citySlug) return null;

  const transport = recordValue(data.transportation);
  const transportDefinitions = [
    ['cityCenter', 'Şehir merkezinden ulaşım'], ['busStation', 'Otogardan ulaşım'],
    ['airport', 'Havalimanından ulaşım'], ['trainStation', 'Tren garından ulaşım'],
    ['privateVehicle', 'Özel araçla ulaşım'], ['general', 'Genel ulaşım notu'],
  ] as const;
  const legacyTransport = stringValue(data.transportation) ?? stringValue(data.transport) ?? stringValue(data.howToGetThere);
  const transportationMethods = transportDefinitions.flatMap(([key, label]) => {
    const field = contentField(transport[key], key === 'general' ? legacyTransport : null);
    return field.value ? [{ key, label, value: field.value, verificationStatus: field.verificationStatus, sourceUrl: field.sourceUrl }] : [];
  });

  const joiningData = recordValue(data.joining);
  const joiningDefinitions = [
    ['general', 'Katılış için genel not'], ['gate', 'Nizamiye / teslim noktası'],
    ['dispatchReminder', 'Sevk belgesi hatırlatması'], ['documentReminder', 'Kimlik / belge hatırlatması'],
    ['importantNote', 'Önemli teslim notu'],
  ] as const;
  const joining = joiningDefinitions.flatMap(([key, label]) => {
    const field = contentField(joiningData[key], key === 'general' ? data.joiningNotes : null);
    return field.value ? [{ key, label, value: field.value, verificationStatus: field.verificationStatus, sourceUrl: field.sourceUrl }] : [];
  });

  const preparation = recordValue(data.preparation);
  const preparationField = contentField(preparation.notes, data.preparationNotes);
  const facilitiesData = recordValue(data.facilities);
  const facilityDefinitions = [
    ['canteen', 'Kantin'], ['infirmary', 'Revir'], ['atm', 'ATM'], ['barber', 'Berber'],
    ['diningHall', 'Yemekhane'], ['communication', 'Telefon / iletişim'],
    ['visitorArea', 'Ziyaretçi alanı'], ['parking', 'Otopark'],
  ] as const;
  const mapFacility = (value: unknown, fallbackLabel: string) => {
    const facility = recordValue(value);
    const rawStatus = stringValue(facility.status);
    const legacyVerification = rawStatus === 'reported' || rawStatus === 'verified' ? rawStatus : null;
    const availability = rawStatus === 'available' || legacyVerification
      ? 'available' as const
      : rawStatus === 'unavailable' ? 'unavailable' as const : null;
    if (!availability) return null;
    return {
      label: stringValue(facility.name) ?? fallbackLabel,
      availability,
      verificationStatus: (legacyVerification ?? fieldVerification(facility.verificationStatus)) as UnitFieldVerification,
      note: stringValue(facility.note),
    };
  };
  const facilities = facilityDefinitions.flatMap(([key, label]) => {
    const item = mapFacility(facilitiesData[key], label);
    return item ? [item] : [];
  });
  if (Array.isArray(data.otherFacilities)) {
    for (const value of data.otherFacilities) {
      const item = mapFacility(value, 'Diğer olanak');
      if (item) facilities.push(item);
    }
  }

  const contactData = recordValue(data.contact);
  const sources = (Array.isArray(data.sources) ? data.sources : []).flatMap((value) => {
    const source = recordValue(value);
    const title = stringValue(source.title);
    const url = urlValue(source.url);
    if (!title && !url) return [];
    const sourceType = stringValue(source.type);
    const type: PublicMilitaryUnit['sources'][number]['type'] =
      sourceType === 'official' || sourceType === 'map' || sourceType === 'institutional' || sourceType === 'community'
        ? sourceType
        : 'other';
    return [{ title, url, type, accessedAt: dateValue(source.accessedAt) ?? stringValue(source.accessedAt), note: stringValue(source.note) }];
  });
  if (!sources.length && (stringValue(data.sourceTitle ?? data.sourceLabel ?? data.source) || urlValue(data.sourceUrl))) {
    sources.push({ title: stringValue(data.sourceTitle ?? data.sourceLabel ?? data.source), url: urlValue(data.sourceUrl), type: 'other', accessedAt: null, note: null });
  }

  const faqs = Array.isArray(data.faqs) ? data.faqs.flatMap((value, index) => {
    const faq = recordValue(value);
    const question = stringValue(faq.question);
    const answer = stringValue(faq.answer);
    return question && answer ? [{
      id: stringValue(faq.id) ?? `${id}-faq-${index + 1}`,
      question,
      answer,
      verificationStatus: fieldVerification(faq.verificationStatus),
      sourceUrl: urlValue(faq.sourceUrl),
    }] : [];
  }) : [];

  const status = publicationStatus(data);
  const audiences = stringList(data.audiences);
  const audience = stringValue(data.audience);
  return {
    id, name, shortName, aliases: stringList(data.aliases), city, citySlug, district, force,
    unitType: stringValue(data.unitType) ?? stringValue(data.type),
    audiences: audiences.length ? audiences : audience ? [audience] : [],
    address: stringValue(data.address) ?? stringValue(data.location),
    locationDescription: stringValue(data.locationDescription),
    locationVerificationStatus: fieldVerification(data.locationVerificationStatus ?? data.coordinateVerificationStatus),
    latitude: numberValue(data.latitude) ?? numberValue(recordValue(data.coordinates).latitude),
    longitude: numberValue(data.longitude) ?? numberValue(recordValue(data.coordinates).longitude),
    mapSourceUrl: urlValue(data.mapSourceUrl),
    mapStatus: data.mapStatus === 'verified' || data.mapStatus === 'candidate' ? data.mapStatus : 'query-only',
    transportationMethods, standfirst: stringValue(data.standfirst), introduction: stringValue(data.introduction ?? data.about),
    highlights: stringList(data.highlights), verifiedFacts: stringList(data.verifiedFacts ?? data.facts), joining,
    preparationNotes: preparationField.value ? { value: preparationField.value, verificationStatus: preparationField.verificationStatus, sourceUrl: preparationField.sourceUrl } : null,
    preparationFacts: stringList(preparation.importantFacts), facilities,
    contact: { officialPhone: stringValue(contactData.officialPhone), officialWebsite: urlValue(contactData.officialWebsite), note: stringValue(contactData.note) },
    faqs, verificationStatus: globalVerification(data), verifiedAt: dateValue(data.verifiedAt) ?? stringValue(data.verifiedAt), sources,
    sourceNote: stringValue(data.sourceNote), publicationStatus: status, indexable: status === 'published' && data.indexable === true,
    seoTitle: stringValue(data.seoTitle), metaDescription: stringValue(data.metaDescription), ogImage: urlValue(data.ogImage),
    createdAt: dateValue(data.createdAt), updatedAt, slug,
    legacySlugs: stringList(data.legacySlugs ?? data.slugHistory).map(slugifyUnit).filter((value) => value && value !== slug),
  };
}

const loadMilitaryUnits = cache(async () => {
  const result = await queryFirestoreDocuments({ collection: '_adminMilitaryUnits', limit: 250 })
    .catch(() => ({ records: [], nextCursor: null }));
  return result.records.flatMap(({ id, data }) => {
    const unit = mapMilitaryUnitRecord(id, data);
    return unit ? [unit] : [];
  }).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt) || a.name.localeCompare(b.name, 'tr'));
});

export const listPublishedMilitaryUnits = cache(async () =>
  (await loadMilitaryUnits()).filter((unit) => unit.publicationStatus === 'published'),
);

export const listIndexableMilitaryUnits = cache(async () =>
  (await listPublishedMilitaryUnits()).filter((unit) => unit.indexable),
);

export async function getMilitaryUnitCity(citySlug: string) {
  const units = (await listIndexableMilitaryUnits()).filter((unit) => unit.citySlug === citySlug);
  return units.length >= 2 ? { city: units[0].city, units } : null;
}

export async function resolveMilitaryUnitRoute(citySlug: string, unitSlug: string) {
  const unit = (await listPublishedMilitaryUnits()).find(
    (item) => item.citySlug === citySlug && (item.slug === unitSlug || item.legacySlugs.includes(unitSlug)),
  );
  if (!unit) return null;
  return { unit, canonicalPath: `/birlikler/${unit.citySlug}/${unit.slug}`, isCanonical: unit.slug === unitSlug && unit.citySlug === citySlug };
}

export function unitLastModified(unit: PublicMilitaryUnit) {
  return unit.updatedAt.slice(0, 10);
}
