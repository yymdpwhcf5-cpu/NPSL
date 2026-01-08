const express = require("express");
const app = express();

// basic route so Railway has something to respond with
app.get("/", (req, res) => {
  res.send("NPSL server is running ✅");
});

// Railway provides the PORT automatically
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`NPSL server listening on port ${PORT}`);
});
