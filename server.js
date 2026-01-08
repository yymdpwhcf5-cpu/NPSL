import express from "express";
import cookieParser from "cookie-parser";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const app = express();
app.use(express.json());
app.use(cookieParser());

const PORT = process.env.PORT || 3000;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const JWT_SECRET = process.env.JWT_SECRET;

if (!ADMIN_PASSWORD || !JWT_SECRET) {
  throw new Error("Missing ADMIN_PASSWORD or JWT_SECRET");
}

const ADMIN_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

function requireAdmin(req, res, next) {
  const token = req.cookies.npsl_admin;
  if (!token) return res.status(401).json({ error: "Not admin" });

  try {
    jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

app.post("/api/admin/login", async (req, res) => {
  const { password } = req.body;
  const ok = await bcrypt.compare(password, ADMIN_HASH);
  if (!ok) return res.status(401).json({ error: "Wrong password" });

  const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: "7d" });
  res.cookie("npsl_admin", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: true
  });

  res.json({ ok: true });
});

app.get("/api/admin/me", (req, res) => {
  try {
    jwt.verify(req.cookies.npsl_admin, JWT_SECRET);
    res.json({ isAdmin: true });
  } catch {
    res.json({ isAdmin: false });
  }
});

app.post("/api/points/update", requireAdmin, (req, res) => {
  res.json({ ok: true, message: "Admin-only action allowed" });
});

app.get("/", (req, res) => {
  res.send("NPSL Hub backend is running");
});

app.listen(PORT, () => {
  console.log("NPSL Hub running on port", PORT);
});
