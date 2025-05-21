// server.js

// ─── Load environment variables ────────────────────────────────────────────────
require("dotenv").config();

const express    = require("express");
const path       = require("path");
const cors       = require("cors");
const bodyParser = require("body-parser");

// ─── Route modules ─────────────────────────────────────────────────────────────
const authRoutes        = require("./routes/auth");
const energyRoutes      = require("./routes/energy");
const transactionRoutes = require("./routes/transactions");
const walletRoutes      = require("./routes/wallet");
const offersRoutes      = require("./routes/offers");
const auctionRoutes     = require("./routes/auction");

const app  = express();
const PORT = process.env.PORT || 3000;

// ─── Middleware ───────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(bodyParser.json());

// ─── Mount your API routes ────────────────────────────────────────────────────
app.use("/api/auth", authRoutes);
app.use("/api/energy", energyRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/offers", offersRoutes);
app.use("/api/auction", auctionRoutes);

// ─── Serve your frontend ───────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "../frontend")));

// Always return index.html for any other requests (for client-side routing)
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
});

// ─── Start server ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});
