// routes/materials.js — Materiallar uchun CRUD API (database bilan ishlaydi)

const express = require('express');
const db = require('../db');
const { requireAdmin } = require('../middleware/auth');
const router = express.Router();

// Ma'lumotlar bazasidagi qator (row) ni frontend kutayotgan formatga o'giradi
function toClientShape(row) {
  return {
    id: row.id,
    title: row.title,
    subject: row.subject,
    grade: row.grade,
    type: row.type,
    term: row.term,
    views: row.views,
    date: new Date(row.created_at).toLocaleDateString('uz-UZ', {
      day: 'numeric', month: 'short', year: 'numeric'
    }),
    questionsContent: row.questions_content,
    answersContent: row.answers_content
  };
}

// GET /api/materials?search=&grade=&type=&term=
router.get('/', (req, res) => {
  const { search = '', grade = '', type = '', term = '' } = req.query;

  let query = 'SELECT * FROM materials WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND (LOWER(title) LIKE ? OR LOWER(subject) LIKE ?)';
    params.push(`%${search.toLowerCase()}%`, `%${search.toLowerCase()}%`);
  }
  if (grade) {
    query += ' AND grade = ?';
    params.push(Number(grade));
  }
  if (type) {
    query += ' AND type = ?';
    params.push(type);
  }
  if (term) {
    query += ' AND term = ?';
    params.push(Number(term));
  }

  query += ' ORDER BY created_at DESC, id DESC';

  const rows = db.prepare(query).all(...params);
  res.json(rows.map(toClientShape));
});

// GET /api/materials/:id  (ko'rishlar sonini +1 oshiradi)
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  db.prepare('UPDATE materials SET views = views + 1 WHERE id = ?').run(id);
  const row = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);

  if (!row) return res.status(404).json({ error: 'Material topilmadi' });
  res.json(toClientShape(row));
});

// POST /api/materials  (faqat admin)
router.post('/', requireAdmin, (req, res) => {
  const { title, subject, grade, type, term, questionsContent, answersContent } = req.body;

  if (!title || !subject || !grade || !type || !term || !questionsContent) {
    return res.status(400).json({ error: 'Majburiy maydonlar to\'ldirilmagan' });
  }

  const info = db.prepare(`
    INSERT INTO materials (title, subject, grade, type, term, views, questions_content, answers_content)
    VALUES (?, ?, ?, ?, ?, 0, ?, ?)
  `).run(title, subject, Number(grade), type, Number(term), questionsContent, answersContent || null);

  const row = db.prepare('SELECT * FROM materials WHERE id = ?').get(info.lastInsertRowid);
  res.status(201).json(toClientShape(row));
});

// PUT /api/materials/:id  (faqat admin)
router.put('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Material topilmadi' });

  const { title, subject, grade, type, term, questionsContent, answersContent } = req.body;

  db.prepare(`
    UPDATE materials
    SET title = ?, subject = ?, grade = ?, type = ?, term = ?, questions_content = ?, answers_content = ?
    WHERE id = ?
  `).run(
    title ?? existing.title,
    subject ?? existing.subject,
    grade ? Number(grade) : existing.grade,
    type ?? existing.type,
    term ? Number(term) : existing.term,
    questionsContent ?? existing.questions_content,
    answersContent ?? existing.answers_content,
    id
  );

  const row = db.prepare('SELECT * FROM materials WHERE id = ?').get(id);
  res.json(toClientShape(row));
});

// DELETE /api/materials/:id  (faqat admin)
router.delete('/:id', requireAdmin, (req, res) => {
  const id = Number(req.params.id);
  const info = db.prepare('DELETE FROM materials WHERE id = ?').run(id);

  if (info.changes === 0) return res.status(404).json({ error: 'Material topilmadi' });
  res.json({ success: true });
});

module.exports = router;
