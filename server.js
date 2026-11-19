const path = require("path");
const express = require("express");

const PORT = Number(process.env.PORT) || 3002;
const app = express();

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, service: "platina" });
});

app.use(
  express.static(__dirname, {
    index: "index.html",
    dotfiles: "ignore",
  })
);

app.listen(PORT, () => {
  console.log(`PLATINA: http://localhost:${PORT}`);
});