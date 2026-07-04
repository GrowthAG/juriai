import nextEnv from "@next/env";
import pg from "pg";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL ausente.");
  process.exit(1);
}

let host = "desconhecido";
let database = "desconhecido";

try {
  const parsed = new URL(databaseUrl);
  host = parsed.hostname || host;
  database = (parsed.pathname || "").replace(/^\//, "") || database;
} catch {
  // Mantém os campos anonimizados caso a URL não seja parseável.
}

const client = new pg.Client({
  connectionString: databaseUrl,
  connectionTimeoutMillis: 8000,
});

try {
  await client.connect();
  const { rows } = await client.query(
    "select current_database() as current_database, current_user as current_user, now() as now"
  );
  const row = rows[0] || {};

  console.log("✅ Conexão com o banco OK");
  console.log(`   host: ${host}`);
  console.log(`   database: ${row.current_database || database}`);
  console.log(`   user: ${row.current_user || "desconhecido"}`);
  console.log(`   now: ${row.now || "desconhecido"}`);
} catch (error) {
  console.error("❌ Falha ao conectar no banco.");
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
} finally {
  await client.end().catch(() => {});
}
