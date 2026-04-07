const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/feedback — requires login (not guest)
router.post('/', auth, async (req, res) => {
  if (!req.userId) {
    return res.status(401).json({ error: 'Login required to submit feedback' });
  }
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Content is required' });
  }
  await pool.query(
    'INSERT INTO feedback (user_id, content) VALUES ($1, $2)',
    [req.userId, content.trim()]
  );
  res.json({ ok: true });
});

module.exports = router;
