const express = require("express");
const db = require("../db");
const router = express.Router();

router.post("/register", (req, res) => {
    console.log("Received registration request with body:", req.body);
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        console.error("Missing required fields in registration request.");
        return res.status(400).json({ error: "Missing required fields" });
    }

    const sql = "INSERT INTO users (name, email, password, wallet_address, created_at) VALUES (?, ?, ?, '', NOW())";
    db.query(sql, [username, email, password], (err, result) => {
        if (err) {
            console.error("Database error during registration:", err);
            return res.status(500).json({ error: "Database error: " + err.sqlMessage });
        }
        console.log("Registration successful:", result);
        res.status(201).json({ message: "User registered successfully!" });
    });
});

// Login Route (unchanged)
router.post("/login", (req, res) => {
    console.log("Received login request with body:", req.body);
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }
    const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(sql, [email, password], (err, results) => {
        if (err) {
            console.error("Database error during login:", err);
            return res.status(500).json({ error: "Database error" });
        }
        console.log("Database returned results:", results);
        if (!results || results.length === 0) {
            return res.status(401).json({ error: "Invalid credentials" });
        }
        res.json({ message: "Login successful", user: results[0] });
    });
});

module.exports = router;
