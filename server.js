import express from "express";
import pkg from "pg";

const { Pool } = pkg;
const app = express();

app.use(express.json());

/* ============================
   DATABASE SETUP
============================ */

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL not set");
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

await pool.query(`
  CREATE TABLE IF NOT EXISTS kv_store (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL
  );
`);

console.log("Database initialized");

/* ============================
   ADMIN AUTH MIDDLEWARE
============================ */

function requireAdmin(req, res, next) {
  const pass = req.header("x-admin-password");

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: "ADMIN_PASSWORD not set" });
  }

  if (!pass || pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false });
  }

  next();
}

/* ============================
   HEALTH CHECK
============================ */

app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

/* ============================
   READ DATA (PUBLIC)
============================ */

app.get("/data", async (req, res) => {
  const result = await pool.query("SELECT key, value FROM kv_store");
  const data = {};

  for (const row of result.rows) {
    data[row.key] = row.value;
  }

  res.json(data);
});

/* ============================
   WRITE DATA (ADMIN ONLY)
============================ */

app.post("/admin/data", requireAdmin, async (req, res) => {
  const entries = Object.entries(req.body);

  for (const [key, value] of entries) {
    await pool.query(
      `INSERT INTO kv_store (key, value)
       VALUES ($1, $2)
       ON CONFLICT (key)
       DO UPDATE SET value = EXCLUDED.value`,
      [key, value]
    );
  }

  res.json({ ok: true });
});

/* ============================
   START SERVER
============================ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`NPSL server listening on port ${PORT}`);
});
