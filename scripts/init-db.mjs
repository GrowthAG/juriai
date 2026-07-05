// Aplica prisma/init.sql no banco (workaround: o schema-engine do Prisma
// trava em alguns ambientes; o driver pg funciona normalmente).
// Uso: npm run db:init   (precisa do proxy rodando — npm run proxy)
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import nextEnv from "@next/env";
import pg from "pg";

const __dirname = dirname(fileURLToPath(import.meta.url));
const { loadEnvConfig } = nextEnv;
loadEnvConfig(join(__dirname, ".."));

const sql = readFileSync(join(__dirname, "..", "prisma", "init.sql"), "utf8");

const client = new pg.Client({
  connectionString: process.env.DATABASE_URL,
  connectionTimeoutMillis: 8000,
});

try {
  await client.connect();
  await client.query(sql);
  const { rows } = await client.query(
    "select tablename from pg_tables where schemaname='public' order by 1",
  );
  console.log("✅ Tabelas:", rows.map((r) => r.tablename).join(", "));
} catch (e) {
  console.error("❌", e.message);
  process.exit(1);
} finally {
  await client.end();
}
