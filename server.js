import express from "express";

const app = express();
app.use(express.json());

// ===============================
// Admin protection middleware
// ===============================
function requireAdmin(req, res, next) {
  const pass = req.header("x-admin-password");

  // Hard fail if not configured in Railway
  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({
      ok: false,
      error: "ADMIN_PASSWORD not set",
    });
  }

  // Reject missing or incorrect password
  if (!pass || pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false });
  }

  next();
}

// ===============================
// Public routes (NO auth)
// ===============================
app.get("/", (req, res) => {
  res.status(200).send("NPSL server is running ✅");
});

// ===============================
// Admin routes (PROTECTED)
// ===============================

// Simple admin verification
app.post("/admin/check", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

// Example: reset league/season
app.post("/admin/reset", requireAdmin, (req, res) => {
  // TODO: real reset logic later
  res.json({ ok: true, action: "reset" });
});

// Example: update player points
app.post("/admin/points", requireAdmin, (req, res) => {
  const { player, points } = req.body || {};

  if (!player || typeof points !== "number") {
    return res.status(400).json({
      ok: false,
      error: "player and numeric points required",
    });
  }

  // TODO: real points logic later
  res.json({
    ok: true,
    player,
    points,
  });
});

// ===============================
// Server
// ===============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NPSL server listening on port ${PORT}`);
});
