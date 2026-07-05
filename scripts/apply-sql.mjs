import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import nextEnv from "@next/env";
import pg from "pg";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const file = process.argv[2];

if (!file) {
  console.error("Uso: node scripts/apply-sql.mjs <arquivo.sql>");
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL ausente.");
  process.exit(1);
}

const sql = await readFile(resolve(file), "utf8");
const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 10_000,
  query_timeout: 30_000,
});

await client.connect();

try {
  await client.query(sql);
  console.log(`Patch aplicado: ${file}`);
} finally {
  await client.end();
}
