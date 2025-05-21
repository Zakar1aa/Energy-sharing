// routes/offers.js
const express = require("express");
const router = express.Router();
const db = require("../db");

// POST /api/offers - Create a new offer
router.post("/", (req, res) => {
  const { user_id, energy_amount, price, description } = req.body;
  if (!user_id || !energy_amount || !price) {
    return res.status(400).json({ error: "Missing required fields: user_id, energy_amount, or price" });
  }
  const sql = "INSERT INTO offers (user_id, energy_amount, price, description, created_at) VALUES (?, ?, ?, ?, NOW())";
  db.query(sql, [user_id, energy_amount, price, description || ""], (err, result) => {
    if (err) {
      console.error("Database error posting offer:", err);
      return res.status(500).json({ error: "Database error: " + err.sqlMessage });
    }
    res.status(201).json({ message: "Offer posted successfully", offer_id: result.insertId });
  });
});

// GET /api/offers - Retrieve all offers
router.get("/", (req, res) => {
  // Optionally, join with users table to get seller's name
  const sql = "SELECT o.*, u.name AS seller FROM offers o JOIN users u ON o.user_id = u.id ORDER BY created_at DESC";
  db.query(sql, (err, results) => {
    if (err) {
      console.error("Database error fetching offers:", err);
      return res.status(500).json({ error: "Database error: " + err.sqlMessage });
    }
    res.json({ offers: results });
  });
});

module.exports = router;
