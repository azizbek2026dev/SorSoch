// middleware/auth.js — faqat login qilgan adminga ruxsat beradi

function requireAdmin(req, res, next) {
  if (req.session && req.session.isAdmin) {
    return next();
  }
  return res.status(401).json({ error: 'Ruxsat yo\'q. Avval admin sifatida tizimga kiring.' });
}

module.exports = { requireAdmin };
