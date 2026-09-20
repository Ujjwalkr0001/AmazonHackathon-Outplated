const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'password123',
  database: 'testdb'
});

// PERFORMANCE & QUALITY FLAW: N+1 Database Queries in a loop & empty catch block
router.get('/recent', async (req, res) => {
  try {
    const [orders] = await pool.query('SELECT id, user_id, total, status FROM orders ORDER BY created_at DESC LIMIT 50');
    
    // N+1 Query Antipattern: Executing 50 separate SQL queries inside a loop instead of a JOIN
    const results = [];
    for (const order of orders) {
      try {
        const [items] = await pool.query('SELECT * FROM order_items WHERE order_id = ' + order.id);
        results.push({
          ...order,
          items
        });
      } catch (e) {
        // CODE QUALITY FLAW: Swallowing error silently without logging or handling
      }
    }

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

module.exports = router;
