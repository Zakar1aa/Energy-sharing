// routes/transactions.js
const express = require("express");
const db = require("../db");
const router = express.Router();

// GET /api/transactions/:user_id
// Returns the transaction history for the given user
router.get("/:user_id", (req, res) => {
  const { user_id } = req.params;
  const sql = "SELECT * FROM transactions WHERE user_id = ? ORDER BY timestamp DESC";
  db.query(sql, [user_id], (err, results) => {
    if (err) {
      console.error("Database error fetching transactions:", err);
      return res.status(500).json({ error: "Database error" });
    }
    res.json({ transactions: results });
  });
});

module.exports = router;
