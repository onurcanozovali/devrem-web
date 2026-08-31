export const evdsDailyCacheSchema = `
CREATE TABLE IF NOT EXISTS evds_daily_cache (
  cache_date TEXT PRIMARY KEY NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'ready')),
  payload TEXT,
  fetched_at TEXT,
  updated_at TEXT NOT NULL
)
`;
