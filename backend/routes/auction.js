// routes/auction.js

require("dotenv").config();
const express = require("express");
const { ethers } = require("ethers");
const { NonceManager } = require("@ethersproject/experimental");
const router = express.Router();

// ─── RPC & Contract Setup ─────────────────────────────────────────────────────
const provider = new ethers.providers.JsonRpcProvider(
  process.env.BLOCKCHAIN_RPC_URL
);
const contractAddress = process.env.ENERGY_TOKEN_ADDRESS;
const abi = [
  "function transferEnergy(address,uint256) external",
  "function balances(address) view returns (uint256)"
];

// ─── Load signers & addresses ─────────────────────────────────────────────────
const PRIVATE_KEYS = {
  prosumer1: process.env.PK_PROSUMER1,
  prosumer2: process.env.PK_PROSUMER2,
  prosumer3: process.env.PK_PROSUMER3,
  prosumer4: process.env.PK_PROSUMER4,
};

const contracts = {};
const ADDRESSES = {};

for (const [name, key] of Object.entries(PRIVATE_KEYS)) {
  if (!key) throw new Error(`Missing .env private key for ${name}`);
  const wallet = new ethers.Wallet(key, provider);
  const nm     = new NonceManager(wallet);
  contracts[name] = new ethers.Contract(contractAddress, abi, nm);
  ADDRESSES[name] = wallet.address;
}

// ─── In-memory order book & history ────────────────────────────────────────────
let bids    = [];
let asks    = [];
let history = [];

/**
 * POST /api/auction/submit
 * Body: { role: "buy"|"sell", prosumer: "prosumer1", qty: number, price: number }
 */
router.post("/submit", (req, res) => {
  const { role, prosumer, qty, price } = req.body;
  if (!["buy", "sell"].includes(role) ||
      !contracts[prosumer] ||
      isNaN(qty)   || qty   <= 0 ||
      isNaN(price) || price <= 0
  ) {
    return res.status(400).json({ error: "Invalid order parameters" });
  }
  const entry = {
    prosumer,
    address: ADDRESSES[prosumer],
    qty: Number(qty),
    price: Number(price),
  };
  if (!entry.address) {
    return res.status(500).json({ error: `No address for ${prosumer}` });
  }

  if (role === "buy") bids.push(entry);
  else              asks.push(entry);

  return res.json({ message: "Order accepted", bids: bids.length, asks: asks.length });
});

/**
 * GET /api/auction/book
 * Returns current bids & asks
 */
router.get("/book", (req, res) => {
  res.json({ bids, asks });
});

/**
 * GET /api/auction/history
 * Returns array of past matches
 */
router.get("/history", (req, res) => {
  res.json(history);
});

/**
 * Auction clearing every 30 seconds
 */
async function clearAuction() {
  if (bids.length === 0 || asks.length === 0) return;

  bids.sort((a, b) => b.price - a.price);
  asks.sort((a, b) => a.price - b.price);

  const matches = Math.min(bids.length, asks.length);
  for (let i = 0; i < matches; i++) {
    const bid = bids[i];
    const ask = asks[i];

    if (bid.prosumer === ask.prosumer) {
      console.warn(`Skipping self-match for ${bid.prosumer}`);
      continue;
    }

    if (!bid.address || !ask.address) {
      console.error("Malformed order entry:", { bid, ask });
      continue;
    }

    const tradeQty   = Math.min(bid.qty, ask.qty);
    const clearPrice = (bid.price + ask.price) / 2;

    console.log(
      `Match ${i+1}: SELL ${ask.prosumer} → BUY ${bid.prosumer}`,
      `qty=${tradeQty} @ price=${clearPrice.toFixed(4)}`
    );

    try {
      const tx = await contracts[ask.prosumer]
        .transferEnergy(
          bid.address,
          ethers.utils.parseUnits(tradeQty.toString(), 18)
        );
      await tx.wait();
      console.log("On-chain transfer:", tx.hash);

      // record history
      history.push({
        buyer:     bid.prosumer,
        seller:    ask.prosumer,
        qty:       tradeQty,
        price:     clearPrice,
        txHash:    tx.hash,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error("Transfer failed:", err);
    }

    bid.qty -= tradeQty;
    ask.qty -= tradeQty;
  }

  bids = bids.filter(o => o.qty > 0);
  asks = asks.filter(o => o.qty > 0);
}

setInterval(clearAuction, 30_000);

module.exports = router;
