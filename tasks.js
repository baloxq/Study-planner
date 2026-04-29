const express = require('express');
const router = express.Router();
const db = require('./db');
const auth = require('./middleware');

router.post('/', auth, (req, res) => {
  const { title, subject, priority, date } = req.body;

  if (!title) return res.status(400).json({ error: "Invalid input" });

  db.run(
    "INSERT INTO tasks (user_id, title, subject, priority, date) VALUES (?, ?, ?, ?, ?)",
    [req.user.id, title, subject, priority, date],
    function () {
      res.json({ id: this.lastID });
    }
  );
});

router.get('/', auth, (req, res) => {
  db.all("SELECT * FROM tasks WHERE user_id=?", [req.user.id], (err, rows) => {
    res.json(rows);
  });
});

router.delete('/:id', auth, (req, res) => {
  db.run(
    "DELETE FROM tasks WHERE id=? AND user_id=?",
    [req.params.id, req.user.id],
    function () {
      res.json({ deleted: this.changes });
    }
  );
});

router.get('/search/:q', auth, (req, res) => {
  db.all(
    "SELECT * FROM tasks WHERE user_id=? AND title LIKE ?",
    [req.user.id, `%${req.params.q}%`],
    (err, rows) => {
      if (!rows.length) return res.json({ message: "No results" });
      res.json(rows);
    }
  );
});

module.exports = router;