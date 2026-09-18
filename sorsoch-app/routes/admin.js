// routes/admin.js — admin login, logout, status

const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Parolni serverda hash ko'rinishida saqlaymiz (xotirada, .env dan olib hashlaymiz)
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'azizbek1258';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(ADMIN_PASSWORD, 10);

// POST /api/admin/login
router.post('/login', (req, res) => {
  const { password } = req.body;

  if (!password || !bcrypt.compareSync(password, ADMIN_PASSWORD_HASH)) {
    return res.status(401).json({ error: 'Parol noto\'g\'ri!' });
  }

  req.session.isAdmin = true;
  res.json({ success: true });
});

// POST /api/admin/logout
router.post('/logout', (req, res) => {
  req.session = null;
  res.json({ success: true });
});

// GET /api/admin/status
router.get('/status', (req, res) => {
  res.json({ isAdmin: !!(req.session && req.session.isAdmin) });
});

module.exports = router;
