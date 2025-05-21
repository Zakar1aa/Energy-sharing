const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",  // Your MySQL password if you have one
    database: "energy_bc" // Use underscore `_` instead of hyphen `-`
});

db.connect(err => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("MySQL Connected...");
});

module.exports = db;
