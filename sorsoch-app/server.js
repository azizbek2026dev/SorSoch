// server.js — SorSoch.com asosiy server fayli

require('dotenv').config();
const path = require('path');
const express = require('express');
const cookieSession = require('cookie-session');

const materialsRouter = require('./routes/materials');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(cookieSession({
  name: 'sorsoch_session',
  keys: [process.env.SESSION_SECRET || 'dev_secret_ozgartiring'],
  maxAge: 24 * 60 * 60 * 1000 // 24 soat
}));

// Statik fayllar (HTML/CSS/JS) — public papkasidan xizmat qiladi
app.use(express.static(path.join(__dirname, 'public')));

// API yo'nalishlari
app.use('/api/materials', materialsRouter);
app.use('/api/admin', adminRouter);

// Boshqa barcha yo'llar uchun asosiy sahifani qaytaramiz
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`SorSoch.com server ishga tushdi: http://localhost:${PORT}`);
});
