#!/usr/bin/env node
// Applies db/schema.sql (and db/seed.sql with --seed) to the Neon database in
// DATABASE_URL. Statements are split on semicolons at end of line, so the SQL
// files intentionally contain no function bodies.
import { readFileSync } from "node:fs";
import { neon } from "@neondatabase/serverless";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Copy it from Neon → Connect and run:\n  DATABASE_URL=postgres://... npm run db:migrate");
  process.exit(1);
}

const files = ["db/schema.sql"];
if (process.argv.includes("--seed")) files.push("db/seed.sql");

const sql = neon(url);

for (const file of files) {
  const text = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
  const statements = text
    .split(/;\s*\n/)
    .map((s) => s.replace(/^\s*--.*$/gm, "").trim())
    .filter(Boolean);
  console.log(`${file}: ${statements.length} statements`);
  for (const statement of statements) {
    await sql.query(statement);
  }
}

const [{ count }] = await sql`select count(*)::int as count from packages`;
console.log(`Done. packages table has ${count} row(s).`);
