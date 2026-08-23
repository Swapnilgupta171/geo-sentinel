-- queries: one row per user-initiated run
CREATE TABLE IF NOT EXISTS queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity TEXT NOT NULL,
  snapshot_id TEXT NOT NULL,
  created_at TEXT NOT NULL
);

-- responses: one row per country per query (2 rows per query in MVP)
CREATE TABLE IF NOT EXISTS responses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  query_id INTEGER NOT NULL REFERENCES queries(id),
  country TEXT NOT NULL,          -- 'us' or 'de'
  answer_text TEXT,
  citations TEXT,                 -- JSON array of URLs, stored as text
  visibility INTEGER,             -- 0/1 (boolean)
  sentiment REAL,                 -- -1.0 to 1.0
  narrative_summary TEXT
);
