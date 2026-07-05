import nextEnv from "@next/env";
import pg from "pg";
const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());
const c = new pg.Client({ connectionString: process.env.DATABASE_URL, connectionTimeoutMillis: 10000, query_timeout: 30000 });
await c.connect();
const { rows } = await c.query(`SELECT id, title, title LIKE '%—%' AS tem_emdash, title LIKE '%–%' AS tem_endash, title LIKE '%-%' AS tem_hifen FROM "Case" ORDER BY "createdAt" DESC LIMIT 10`);
console.log(JSON.stringify(rows, null, 2));
await c.end();
