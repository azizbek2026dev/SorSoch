// db.js — SQLite ulanishi, jadval sxemasi va boshlang'ich (seed) ma'lumotlar

const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const dbPath = path.join(dataDir, 'sorsoch.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');

// Materiallar jadvali
db.exec(`
  CREATE TABLE IF NOT EXISTS materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    grade INTEGER NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('BSB', 'CHSB')),
    term INTEGER NOT NULL,
    views INTEGER NOT NULL DEFAULT 0,
    questions_content TEXT NOT NULL,
    answers_content TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// Agar jadval bo'sh bo'lsa — boshlang'ich namuna ma'lumotlarni qo'shamiz
const countRow = db.prepare('SELECT COUNT(*) AS count FROM materials').get();

if (countRow.count === 0) {
  const insert = db.prepare(`
    INSERT INTO materials (title, subject, grade, type, term, views, questions_content, answers_content, created_at)
    VALUES (@title, @subject, @grade, @type, @term, @views, @questions_content, @answers_content, @created_at)
  `);

  const seed = [
    {
      title: "Matematika 7-sinf 1-BSB topshiriqlari",
      subject: "Matematika",
      grade: 7,
      type: "BSB",
      term: 1,
      views: 1420,
      questions_content: "1-savol: Kasrlarni ko'paytirish amalini bajaring...\n2-savol: Tenglamani yeching: 2x + 5 = 15.",
      answers_content: "1-javob: 3/4\n2-javob: x = 5.",
      created_at: "2025-10-12 00:00:00"
    },
    {
      title: "Fizika 9-sinf 2-CHSB yakuniy nazorat",
      subject: "Fizika",
      grade: 9,
      type: "CHSB",
      term: 2,
      views: 890,
      questions_content: "1-savol: Nyutonning ikkinchi qonunini ta'riflang va formulasini keltiring.\n2-savol: Jismning erkin tushish tezlanishi g haqida tushuncha bering.",
      answers_content: "1-javob: F = m * a\n2-javob: g = 9.8 m/s^2",
      created_at: "2025-11-18 00:00:00"
    }
  ];

  const insertMany = db.transaction((rows) => {
    for (const row of rows) insert.run(row);
  });
  insertMany(seed);
}

module.exports = db;
