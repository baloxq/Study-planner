const express = require('express');
const router = express.Router();
const db = require('./db');
const jwt = require('jsonwebtoken');

const SECRET = "secret123";

// Auth middleware
function auth(req, res, next) {
  const token = req.headers.authorization;
  if (!token) return res.json({ error: "No token" });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.json({ error: "Invalid token" });
  }
}

// GET all saved resources for the current user
router.get('/', auth, (req, res) => {
  db.all(
    "SELECT * FROM resources WHERE user_id=? ORDER BY saved_at DESC",
    [req.user.id],
    (err, rows) => res.json(rows || [])
  );
});

// POST save a new resource to the database
router.post('/', auth, (req, res) => {
  const { topic, title, summary, url } = req.body;
  db.run(
    "INSERT INTO resources (user_id, topic, title, summary, url) VALUES (?,?,?,?,?)",
    [req.user.id, topic, title, summary, url],
    function () { res.json({ id: this.lastID }); }
  );
});

// DELETE a saved resource
router.delete('/:id', auth, (req, res) => {
  db.run(
    "DELETE FROM resources WHERE id=? AND user_id=?",
    [req.params.id, req.user.id],
    function () { res.json({ deleted: this.changes }); }
  );
});

module.exports = router;
