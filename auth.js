const express = require('express');
const router = express.Router();
const db = require('./db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'change_this_secret_before_deployment';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SAFE_TEXT_RE = /^[\p{L}\p{N}\s.,'’()\-]{2,80}$/u;

function clean(value = '') {
  return String(value).trim().replace(/\s+/g, ' ');
}

function auth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : header;
  if (!token) return res.status(401).json({ error: 'Please login first.' });
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Your session is invalid. Please login again.' });
  }
}

router.post('/register', async (req, res) => {
  const name = clean(req.body.name);
  const email = clean(req.body.email).toLowerCase();
  const password = String(req.body.password || '');

  if (!SAFE_TEXT_RE.test(name)) return res.status(400).json({ error: 'Name may contain only letters, numbers, spaces, comma, dot, apostrophe, dash, and brackets.' });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must contain at least 6 characters.' });

  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (name,email,password) VALUES (?,?,?)', [name, email, hash], function (err) {
    if (err) return res.status(409).json({ error: 'A user with this email already exists.' });
    const token = jwt.sign({ id: this.lastID, role: 'registered' }, SECRET, { expiresIn: '2h' });
    res.status(201).json({ token, user: { id: this.lastID, name, email, role: 'registered' } });
  });
});

router.post('/login', (req, res) => {
  const email = clean(req.body.email).toLowerCase();
  const password = String(req.body.password || '');

  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
  if (!password) return res.status(400).json({ error: 'Password is required.' });

  db.get('SELECT * FROM users WHERE email=?', [email], async (err, user) => {
    if (err) return res.status(500).json({ error: 'Database error while logging in.' });
    if (!user) return res.status(404).json({ error: 'User not found. Check for misspellings or register first.' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ error: 'Wrong password.' });
    const token = jwt.sign({ id: user.id, role: user.role }, SECRET, { expiresIn: '2h' });
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role, program: user.program, university: user.university, level: user.level } });
  });
});

router.get('/me', auth, (req, res) => {
  db.get('SELECT id,name,email,role,program,university,level FROM users WHERE id=?', [req.user.id], (err, user) => {
    if (err || !user) return res.status(404).json({ error: 'Profile not found.' });
    res.json(user);
  });
});

router.put('/profile', auth, (req, res) => {
  const name = clean(req.body.name);
  const program = clean(req.body.program || 'Internet Technology');
  const university = clean(req.body.university || 'Vytautas Magnus University');
  const level = clean(req.body.level || 'Year 2, Semester 2');

  if (!SAFE_TEXT_RE.test(name)) return res.status(400).json({ error: 'Profile name contains unsupported characters.' });
  for (const [label, value] of Object.entries({ program, university, level })) {
    if (!SAFE_TEXT_RE.test(value)) return res.status(400).json({ error: `${label} contains unsupported characters.` });
  }

  db.run('UPDATE users SET name=?, program=?, university=?, level=? WHERE id=?', [name, program, university, level, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: 'Could not update profile.' });
    res.json({ message: 'Profile updated.' });
  });
});

router.authMiddleware = auth;
module.exports = router;
