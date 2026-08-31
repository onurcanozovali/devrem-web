import { env } from 'cloudflare:workers';
import { evdsDailyCacheSchema } from '@/db/schema';

const EVDS_BASE_URL = 'https://evds3.tcmb.gov.tr/igmevdsms-dis';
const SERIES = {
  usd: 'TP.DK.USD.A.YTL',
  eur: 'TP.DK.EUR.A.YTL',
  gold: 'TP.ALTINPIYASA.KAP02',
} as const;

const SERIES_FIELDS = {
  usd: 'TP_DK_USD_A_YTL',
  eur: 'TP_DK_EUR_A_YTL',
  gold: 'TP_ALTINPIYASA_KAP02',
} as const;

const ISTANBUL_TIME_ZONE = 'Europe/Istanbul';
const LOCK_TIMEOUT_MS = 10 * 60 * 1000;

type WorkerBindings = {
  DB?: D1Database;
  EVDS_API_KEY?: string;
};

type EvdsObservation = {
  Tarih: string;
  TP_DK_USD_A_YTL: string | null;
  TP_DK_EUR_A_YTL: string | null;
  TP_ALTINPIYASA_KAP02: string | null;
};

type EvdsResponse = {
  items?: EvdsObservation[];
};

export type MarketValue = {
  date: string;
  value: number;
};

export type MarketHistoryPoint = {
  date: string;
  label: string;
  usd: number;
  eur: number;
  gold: number;
};

export type MarketSnapshot = {
  cacheDate: string;
  fetchedAt: string;
  source: 'live' | 'stale';
  current: {
    usd: MarketValue;
    eur: MarketValue;
    gold: MarketValue;
  };
  previousYear: {
    usd: MarketValue;
    eur: MarketValue;
    gold: MarketValue;
  };
  history: MarketHistoryPoint[];
};

type CachedRow = {
  payload: string | null;
  status: 'pending' | 'ready';
};

let memoryCache: { cacheDate: string; snapshot: MarketSnapshot } | null = null;
let inFlightRequest: Promise<MarketSnapshot> | null = null;

function getIstanbulDateParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: ISTANBUL_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date);

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '';

  return { year: Number(get('year')), month: Number(get('month')), day: Number(get('day')) };
}

function toCacheDate(date = new Date()) {
  const { year, month, day } = getIstanbulDateParts(date);
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function toEvdsDate(date: Date) {
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${day}-${month}-${date.getUTCFullYear()}`;
}

function parseEvdsDate(value: string) {
  const [day, month, year] = value.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function parseValue(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function getLatestValue(
  observations: EvdsObservation[],
  field: keyof Pick<EvdsObservation, 'TP_DK_USD_A_YTL' | 'TP_DK_EUR_A_YTL' | 'TP_ALTINPIYASA_KAP02'>,
  transform: (value: number) => number = (value) => value,
): MarketValue {
  for (let index = observations.length - 1; index >= 0; index -= 1) {
    const parsed = parseValue(observations[index][field]);
    if (parsed !== null) return { date: observations[index].Tarih, value: transform(parsed) };
  }
  throw new Error(`EVDS serisinde kullanılabilir güncel değer bulunamadı: ${field}`);
}

function getPreviousYearValue(
  observations: EvdsObservation[],
  field: keyof Pick<EvdsObservation, 'TP_DK_USD_A_YTL' | 'TP_DK_EUR_A_YTL' | 'TP_ALTINPIYASA_KAP02'>,
  currentDate: string,
  transform: (value: number) => number = (value) => value,
): MarketValue {
  const target = parseEvdsDate(currentDate);
  target.setUTCFullYear(target.getUTCFullYear() - 1);

  for (let index = observations.length - 1; index >= 0; index -= 1) {
    if (parseEvdsDate(observations[index].Tarih) > target) continue;
    const parsed = parseValue(observations[index][field]);
    if (parsed !== null) return { date: observations[index].Tarih, value: transform(parsed) };
  }
  throw new Error(`EVDS serisinde geçen yıl değeri bulunamadı: ${field}`);
}

function buildHistory(observations: EvdsObservation[]): MarketHistoryPoint[] {
  const monthly = new Map<string, MarketHistoryPoint>();

  for (const observation of observations) {
    const usd = parseValue(observation[SERIES_FIELDS.usd]);
    const eur = parseValue(observation[SERIES_FIELDS.eur]);
    const goldKg = parseValue(observation[SERIES_FIELDS.gold]);
    if (usd === null || eur === null || goldKg === null) continue;

    const date = parseEvdsDate(observation.Tarih);
    const key = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
    const label = new Intl.DateTimeFormat('tr-TR', { month: 'short', year: '2-digit', timeZone: 'UTC' }).format(date);
    monthly.set(key, { date: observation.Tarih, label, usd, eur, gold: goldKg / 1000 });
  }

  return Array.from(monthly.values()).slice(-13);
}

function buildSnapshot(observations: EvdsObservation[], cacheDate: string): MarketSnapshot {
  if (!observations.length) throw new Error('EVDS boş veri döndürdü.');

  const currentUsd = getLatestValue(observations, SERIES_FIELDS.usd);
  const currentEur = getLatestValue(observations, SERIES_FIELDS.eur);
  const currentGold = getLatestValue(observations, SERIES_FIELDS.gold, (value) => value / 1000);

  return {
    cacheDate,
    fetchedAt: new Date().toISOString(),
    source: 'live',
    current: { usd: currentUsd, eur: currentEur, gold: currentGold },
    previousYear: {
      usd: getPreviousYearValue(observations, SERIES_FIELDS.usd, currentUsd.date),
      eur: getPreviousYearValue(observations, SERIES_FIELDS.eur, currentEur.date),
      gold: getPreviousYearValue(observations, SERIES_FIELDS.gold, currentGold.date, (value) => value / 1000),
    },
    history: buildHistory(observations),
  };
}

async function fetchEvdsSnapshot(cacheDate: string): Promise<MarketSnapshot> {
  const runtimeEnv = env as unknown as WorkerBindings;
  const apiKey = runtimeEnv.EVDS_API_KEY ?? process.env.EVDS_API_KEY;
  if (!apiKey) throw new Error('EVDS API anahtarı sunucu ortamında tanımlı değil.');

  const { year, month, day } = getIstanbulDateParts();
  const endDate = new Date(Date.UTC(year, month - 1, day));
  const startDate = new Date(endDate);
  startDate.setUTCDate(startDate.getUTCDate() - 390);

  const series = Object.values(SERIES).join('-');
  const url = `${EVDS_BASE_URL}/series=${series}&startDate=${toEvdsDate(startDate)}&endDate=${toEvdsDate(endDate)}&type=json`;
  const response = await fetch(url, { headers: { key: apiKey } });

  if (!response.ok) throw new Error(`EVDS isteği başarısız oldu (${response.status}).`);
  const data = (await response.json()) as EvdsResponse;
  return buildSnapshot(data.items ?? [], cacheDate);
}

async function ensureCacheTable(db: D1Database) {
  await db.prepare(evdsDailyCacheSchema).run();
}

async function readCachedSnapshot(db: D1Database, cacheDate: string) {
  const row = await db
    .prepare('SELECT status, payload FROM evds_daily_cache WHERE cache_date = ?')
    .bind(cacheDate)
    .first<CachedRow>();

  if (row?.status !== 'ready' || !row.payload) return null;
  return JSON.parse(row.payload) as MarketSnapshot;
}

async function readLatestSnapshot(db: D1Database) {
  const row = await db
    .prepare("SELECT status, payload FROM evds_daily_cache WHERE status = 'ready' ORDER BY cache_date DESC LIMIT 1")
    .first<CachedRow>();

  if (!row?.payload) return null;
  return { ...(JSON.parse(row.payload) as MarketSnapshot), source: 'stale' as const };
}

async function waitForLeader(db: D1Database, cacheDate: string) {
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 150));
    const cached = await readCachedSnapshot(db, cacheDate);
    if (cached) return cached;
  }
  return readLatestSnapshot(db);
}

async function loadWithD1(db: D1Database, cacheDate: string): Promise<MarketSnapshot> {
  await ensureCacheTable(db);
  const cached = await readCachedSnapshot(db, cacheDate);
  if (cached) return cached;

  const staleBefore = new Date(Date.now() - LOCK_TIMEOUT_MS).toISOString();
  await db
    .prepare("DELETE FROM evds_daily_cache WHERE status = 'pending' AND updated_at < ?")
    .bind(staleBefore)
    .run();

  const now = new Date().toISOString();
  const claim = await db
    .prepare("INSERT OR IGNORE INTO evds_daily_cache (cache_date, status, payload, fetched_at, updated_at) VALUES (?, 'pending', NULL, NULL, ?)")
    .bind(cacheDate, now)
    .run();

  if ((claim.meta.changes ?? 0) === 0) {
    const leaderResult = await waitForLeader(db, cacheDate);
    if (leaderResult) return leaderResult;
    throw new Error('Günlük EVDS yenilemesi devam ediyor.');
  }

  try {
    const snapshot = await fetchEvdsSnapshot(cacheDate);
    await db
      .prepare("UPDATE evds_daily_cache SET status = 'ready', payload = ?, fetched_at = ?, updated_at = ? WHERE cache_date = ?")
      .bind(JSON.stringify(snapshot), snapshot.fetchedAt, snapshot.fetchedAt, cacheDate)
      .run();
    return snapshot;
  } catch (error) {
    await db.prepare('DELETE FROM evds_daily_cache WHERE cache_date = ?').bind(cacheDate).run();
    const stale = await readLatestSnapshot(db);
    if (stale) return stale;
    throw error;
  }
}

export async function getDailyMarketSnapshot(): Promise<MarketSnapshot> {
  const cacheDate = toCacheDate();
  if (memoryCache?.cacheDate === cacheDate) return memoryCache.snapshot;
  if (inFlightRequest) return inFlightRequest;

  const runtimeEnv = env as unknown as WorkerBindings;
  inFlightRequest = runtimeEnv.DB
    ? loadWithD1(runtimeEnv.DB, cacheDate)
    : fetchEvdsSnapshot(cacheDate);

  try {
    const snapshot = await inFlightRequest;
    memoryCache = { cacheDate, snapshot };
    return snapshot;
  } finally {
    inFlightRequest = null;
  }
}
