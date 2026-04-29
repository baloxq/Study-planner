const express = require('express');
const router = express.Router();
const db = require('./db');
const authRouter = require('./auth');
const auth = authRouter.authMiddleware;

const SAFE_TEXT_RE = /^[\p{L}\p{N}\s.,'’()\-]{2,120}$/u;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const priorities = new Set(['low', 'medium', 'high']);
const types = new Set(['Homework', 'Lecture Review', 'Exam', 'Lab', 'Essay']);

function clean(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

function validateTask(body, partial = false) {
  const title = clean(body.title);
  const subject = clean(body.subject);
  const type = clean(body.type || 'Homework');
  const priority = clean(body.priority || 'medium').toLowerCase();
  const date = clean(body.date);
  const done = body.done === true || body.done === 1 || body.done === '1' ? 1 : 0;

  if (!partial || title) if (!SAFE_TEXT_RE.test(title)) return { error: 'Task title has unsupported characters or is too short.' };
  if (!partial || subject) if (!SAFE_TEXT_RE.test(subject)) return { error: 'Subject has unsupported characters or is too short.' };
  if (!types.has(type)) return { error: 'Unknown task type. Check for misspellings.' };
  if (!priorities.has(priority)) return { error: 'Priority must be low, medium, or high.' };
  if (!DATE_RE.test(date)) return { error: 'Due date must be in YYYY-MM-DD format.' };

  return { title, subject, type, priority, date, done };
}

router.get('/', auth, (req, res) => {
  const status = clean(req.query.status || 'all');
  const search = clean(req.query.search || '');
  const params = [req.user.id];
  let sql = 'SELECT * FROM tasks WHERE user_id=?';

  if (status === 'done') sql += ' AND done=1';
  else if (status === 'todo') sql += ' AND done=0';
  else if (status !== 'all') return res.status(400).json({ error: 'Unknown filter. Use all, todo, or done.' });

  if (search) {
    if (!/^[\p{L}\p{N}\s.,'’()\-]{1,80}$/u.test(search)) return res.status(400).json({ error: 'Search text contains unsupported characters.' });
    sql += ' AND title LIKE ?';
    params.push(`%${search}%`);
  }

  sql += ' ORDER BY date ASC, id DESC';
  db.all(sql, params, (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database search failed.' });
    res.json(rows.map(r => ({ ...r, done: Boolean(r.done) })));
  });
});

router.post('/', auth, (req, res) => {
  const data = validateTask(req.body);
  if (data.error) return res.status(400).json({ error: data.error });
  db.run('INSERT INTO tasks (user_id,title,subject,type,priority,date,done) VALUES (?,?,?,?,?,?,?)',
    [req.user.id, data.title, data.subject, data.type, data.priority, data.date, data.done],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not save task to database.' });
      res.status(201).json({ id: this.lastID, ...data });
    });
});

router.put('/:id', auth, (req, res) => {
  const data = validateTask(req.body);
  if (data.error) return res.status(400).json({ error: data.error });
  db.run('UPDATE tasks SET title=?,subject=?,type=?,priority=?,date=?,done=? WHERE id=? AND user_id=?',
    [data.title, data.subject, data.type, data.priority, data.date, data.done, req.params.id, req.user.id],
    function (err) {
      if (err) return res.status(500).json({ error: 'Could not update task.' });
      if (!this.changes) return res.status(403).json({ error: 'Task not found or belongs to another user.' });
      res.json({ message: 'Task updated.' });
    });
});

router.delete('/:id', auth, (req, res) => {
  db.run('DELETE FROM tasks WHERE id=? AND user_id=?', [req.params.id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: 'Could not delete task.' });
    if (!this.changes) return res.status(403).json({ error: 'Task not found or belongs to another user.' });
    res.json({ deleted: this.changes });
  });
});

module.exports = router;
