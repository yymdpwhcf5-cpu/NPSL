
import express from "express";

const app = express();

app.get("/", (req, res) => {
  res.send("NPSL server is running ✅");
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`NPSL server listening on port ${PORT}`);
});
