import fs from 'fs';
import path from 'path';

let dbInstance: any = null;

function getDb() {
  if (!dbInstance) {
    // Lazy require so top-level module evaluation during Next.js build doesn't throw if native bindings are missing
    const Database = require('better-sqlite3');
    const dbPath = path.join(process.cwd(), 'geo-sentinel.db');
    dbInstance = new Database(dbPath, { verbose: console.log });
    dbInstance.pragma('journal_mode = WAL');

    const schemaPath = path.join(process.cwd(), 'db', 'schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      dbInstance.exec(schema);
    }
  }
  return dbInstance;
}

export interface QueryRecord {
  id: number;
  entity: string;
  snapshot_id: string;
  created_at: string;
}

export interface ResponseRecord {
  id: number;
  query_id: number;
  country: string;
  answer_text: string | null;
  citations: string | null;
  visibility: number | null;
  sentiment: number | null;
  narrative_summary: string | null;
}

// 1. Create a new query
export function createQuery(entity: string, snapshotId: string): number {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO queries (entity, snapshot_id, created_at)
    VALUES (?, ?, ?)
  `);
  const result = stmt.run(entity, snapshotId, new Date().toISOString());
  return result.lastInsertRowid as number;
}

// 2. Fetch a query by ID
export function getQueryById(id: number): QueryRecord | undefined {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM queries WHERE id = ?');
  return stmt.get(id) as QueryRecord | undefined;
}

// 3. Insert raw scraper responses (batch)
export function insertRawResponses(queryId: number, responses: { country: string, answerText: string, citations: string[] }[]) {
  const db = getDb();
  const stmt = db.prepare(`
    INSERT INTO responses (query_id, country, answer_text, citations)
    VALUES (?, ?, ?, ?)
  `);
  
  const insertMany = db.transaction((respData: any[]) => {
    for (const resp of respData) {
      stmt.run(queryId, resp.country, resp.answerText, JSON.stringify(resp.citations));
    }
  });
  
  insertMany(responses);
}

// 4. Update responses with LLM analysis
export function updateResponseAnalysis(queryId: number, country: string, analysis: { visibility: boolean, sentiment: number, narrativeSummary: string }) {
  const db = getDb();
  const stmt = db.prepare(`
    UPDATE responses 
    SET visibility = ?, sentiment = ?, narrative_summary = ?
    WHERE query_id = ? AND country = ?
  `);
  
  stmt.run(
    analysis.visibility ? 1 : 0, 
    analysis.sentiment, 
    analysis.narrativeSummary, 
    queryId, 
    country
  );
}

// 5. Fetch all responses for a query
export function getResponsesByQueryId(queryId: number): ResponseRecord[] {
  const db = getDb();
  const stmt = db.prepare('SELECT * FROM responses WHERE query_id = ?');
  return stmt.all(queryId) as ResponseRecord[];
}

export default getDb;
