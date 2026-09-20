const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// CRITICAL SECURITY FLAW: Hardcoded JWT Secret key
const JWT_SECRET = 'super_secret_production_key_never_share';

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // Flaw: Plaintext password comparison vulnerable to timing attacks
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign(
      { username, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '365d' } // Security flaw: excessively long token expiration
    );
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

module.exports = router;
