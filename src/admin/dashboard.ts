export type Province = {
  plate: number;
  name: string;
  key: string;
};

const provinceNames = [
  'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı', 'Amasya', 'Ankara', 'Antalya',
  'Artvin', 'Aydın', 'Balıkesir', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu',
  'Burdur', 'Bursa', 'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır',
  'Edirne', 'Elazığ', 'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep',
  'Giresun', 'Gümüşhane', 'Hakkari', 'Hatay', 'Isparta', 'Mersin', 'İstanbul',
  'İzmir', 'Kars', 'Kastamonu', 'Kayseri', 'Kırklareli', 'Kırşehir', 'Kocaeli',
  'Konya', 'Kütahya', 'Malatya', 'Manisa', 'Kahramanmaraş', 'Mardin', 'Muğla',
  'Muş', 'Nevşehir', 'Niğde', 'Ordu', 'Rize', 'Sakarya', 'Samsun', 'Siirt',
  'Sinop', 'Sivas', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Şanlıurfa',
  'Uşak', 'Van', 'Yozgat', 'Zonguldak', 'Aksaray', 'Bayburt', 'Karaman',
  'Kırıkkale', 'Batman', 'Şırnak', 'Bartın', 'Ardahan', 'Iğdır', 'Yalova',
  'Karabük', 'Kilis', 'Osmaniye', 'Düzce',
] as const;

export function normalizeProvinceKey(value: unknown) {
  if (typeof value === 'number' && Number.isInteger(value)) {
    return provinceNames[value - 1] ? provinceKey(provinceNames[value - 1]) : null;
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (/^\d{1,2}$/.test(trimmed)) return normalizeProvinceKey(Number(trimmed));
  const normalized = provinceKey(trimmed);
  const aliases: Record<string, string> = {
    AFYON: 'AFYONKARAHISAR',
    ICEL: 'MERSIN',
    URFA: 'SANLIURFA',
    MARAS: 'KAHRAMANMARAS',
  };
  const key = aliases[normalized] ?? normalized;
  return provincesByKey.has(key) ? key : null;
}

function provinceKey(value: string) {
  return value
    .trim()
    .toLocaleUpperCase('tr-TR')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^A-Z0-9]/g, '');
}

export const TURKISH_PROVINCES: Province[] = provinceNames.map((name, index) => ({
  plate: index + 1,
  name,
  key: provinceKey(name),
}));

const provincesByKey = new Map(TURKISH_PROVINCES.map((province) => [province.key, province]));

export function provinceByKey(key: string) {
  return provincesByKey.get(key) ?? null;
}

export function emptyProvinceCounts() {
  return Object.fromEntries(TURKISH_PROVINCES.map(({ key }) => [key, 0]));
}

export function aggregateProvinceValues(values: unknown[]) {
  const counts = emptyProvinceCounts();
  let unmatched = 0;
  for (const value of values) {
    const key = normalizeProvinceKey(value);
    if (!key) {
      unmatched += 1;
      continue;
    }
    counts[key] += 1;
  }
  return {
    counts,
    matched: Object.values(counts).reduce((sum, count) => sum + count, 0),
    unmatched,
  };
}

export function normalizeAggregateCounts(value: unknown) {
  const counts = emptyProvinceCounts();
  let unmatched = 0;
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return { counts, matched: 0, unmatched };
  }
  for (const [rawKey, rawCount] of Object.entries(value as Record<string, unknown>)) {
    const count = typeof rawCount === 'number' && Number.isFinite(rawCount)
      ? Math.max(0, Math.trunc(rawCount))
      : 0;
    const key = normalizeProvinceKey(rawKey);
    if (key) counts[key] += count;
    else unmatched += count;
  }
  return {
    counts,
    matched: Object.values(counts).reduce((sum, count) => sum + count, 0),
    unmatched,
  };
}

export function dashboardDateKey(value: Date | string) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Istanbul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

export function lastDateKeys(days: number, now = new Date()) {
  const keys: string[] = [];
  for (let offset = days - 1; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setUTCDate(date.getUTCDate() - offset);
    const key = dashboardDateKey(date);
    if (key) keys.push(key);
  }
  return keys;
}

export function fillDailyRegistrations(
  registrations: Record<string, number>,
  days = 90,
  now = new Date(),
) {
  return lastDateKeys(days, now).map((date) => ({
    date,
    registrations: Math.max(0, Math.trunc(registrations[date] ?? 0)),
  }));
}

export function periodKey(year: unknown, month: unknown) {
  if (
    typeof year !== 'number' || !Number.isInteger(year) || year < 2000 ||
    typeof month !== 'number' || !Number.isInteger(month) || month < 1 || month > 12
  ) return null;
  return `${year}-${String(month).padStart(2, '0')}`;
}

export function periodLabel(key: string) {
  const match = key.match(/^(\d{4})-(\d{2})$/);
  if (!match) return key;
  return new Intl.DateTimeFormat('tr-TR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Istanbul',
  }).format(new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)));
}

export function isMilitaryProfileComplete(data: Record<string, unknown>) {
  return Boolean(
    normalizeProvinceKey(data.militaryCity) &&
    periodKey(data.militaryPeriodYear, data.militaryPeriodMonth) &&
    typeof data.militaryType === 'string' && data.militaryType.trim() &&
    (
      (typeof data.militaryUnit === 'string' && data.militaryUnit.trim()) ||
      (typeof data.militaryUnitNameSnapshot === 'string' && data.militaryUnitNameSnapshot.trim())
    ),
  );
}

