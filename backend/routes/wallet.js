// routes/wallet.js
const express = require("express");
const db = require("../db");
const { ethers } = require("ethers");
const router = express.Router();

// POST /api/wallet/create
// Generate a new wallet for the user and update the user's record.
router.post("/create", (req, res) => {
  const { user_id } = req.body;
  if (!user_id) {
    return res.status(400).json({ error: "User ID is required" });
  }
  
  // Generate a new wallet using ethers.js
  const wallet = ethers.Wallet.createRandom();
  
  // Update the user's record with the wallet address and private key.
  const sql = "UPDATE users SET wallet_address = ?, wallet_private_key = ? WHERE id = ?";
  db.query(sql, [wallet.address, wallet.privateKey, user_id], (err, result) => {
    if (err) {
      console.error("Database error updating wallet info:", err);
      return res.status(500).json({ error: "Database error: " + err.sqlMessage });
    }
    res.json({ 
      message: "Wallet created successfully", 
      wallet: { address: wallet.address, privateKey: wallet.privateKey } 
    });
  });
});

// GET /api/wallet/:user_id
// Retrieve the wallet information for the specified user.
router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = "SELECT wallet_address, wallet_private_key FROM users WHERE id = ?";
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Database error fetching wallet info:", err);
      return res.status(500).json({ error: "Database error" });
    }
    if (!results || results.length === 0) {
      return res.status(404).json({ error: "Wallet not found" });
    }
    res.json({ wallet: results[0] });
  });
});

module.exports = router;
