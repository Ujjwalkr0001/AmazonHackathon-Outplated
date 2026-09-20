const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password123', // Hardcoded DB credentials!
  database: 'testdb'
});

// CRITICAL VULNERABILITY: Raw SQL Injection via string concatenation
router.get('/search', async (req, res) => {
  const username = req.query.username;
  try {
    // Dangerous: Direct interpolation allows ' OR '1'='1 -- attacks
    const query = "SELECT id, username, email, role FROM users WHERE username = '" + username + "'";
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    // Anti-pattern: Leaking raw database errors directly to the client
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;
