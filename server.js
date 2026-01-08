import express from "express";

const app = express();
app.use(express.json());

// Admin check endpoint (protected)
app.post("/admin/check", (req, res) => {
  const pass = req.header("x-admin-password");

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ ok: false, error: "ADMIN_PASSWORD not set" });
  }

  if (!pass || pass !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ ok: false });
  }

  return res.json({ ok: true });
});

/**
 * Railway health check + root endpoint
 */
app.get("/", (req, res) => {
  res.status(200).send("NPSL server is running ✅");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NPSL server listening on port ${PORT}`);
});
