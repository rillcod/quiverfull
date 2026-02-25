#!/usr/bin/env node
/**
 * Run migrations against your Supabase remote database.
 *
 * Requires: SUPABASE_DB_PASSWORD (from Supabase Dashboard > Project Settings > Database)
 *
 * Usage:
 *   Windows: set SUPABASE_DB_PASSWORD=your_password && node scripts/run-migration.mjs
 *   Mac/Linux: SUPABASE_DB_PASSWORD=your_password node scripts/run-migration.mjs
 */

import pg from 'pg';
import { readFileSync, readdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_REF = 'vitvykboryrudxofgyso';
const MIGRATIONS_DIR = join(__dirname, '../supabase/migrations');

const password = process.env.SUPABASE_DB_PASSWORD;
if (!password) {
  console.error('❌ Set SUPABASE_DB_PASSWORD (from Supabase Dashboard > Project Settings > Database)');
  process.exit(1);
}

const client = new pg.Client({
  host: `db.${PROJECT_REF}.supabase.co`,
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password,
  ssl: { rejectUnauthorized: false },
});

const migrations = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql') && f !== '20250806000000_placeholder.sql')
  .sort();

try {
  await client.connect();
  const { rows } = await client.query(
    `SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'supabase_migrations' AND table_name = 'schema_migrations') AS has_table`
  );
  let applied = new Set();
  if (rows[0]?.has_table) {
    const { rows: r } = await client.query(`SELECT version FROM supabase_migrations.schema_migrations`);
    r.forEach((x) => applied.add(x.version));
  }

  for (const file of migrations) {
    const version = file.replace('.sql', '');
    if (applied.has(version)) {
      console.log(`⏭️  Skipped (already applied): ${file}`);
      continue;
    }
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    await client.query(sql);
    await client.query(
      `INSERT INTO supabase_migrations.schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`,
      [version]
    ).catch(() => {
      client.query(`CREATE SCHEMA IF NOT EXISTS supabase_migrations`).catch(() => {});
      client.query(
        `CREATE TABLE IF NOT EXISTS supabase_migrations.schema_migrations (version text PRIMARY KEY)`
      ).catch(() => {});
    });
    console.log(`✅ Applied: ${file}`);
  }
  console.log('✅ Migrations completed');
} catch (e) {
  console.error('❌ Migration failed:', e.message);
  process.exit(1);
} finally {
  await client.end();
}
