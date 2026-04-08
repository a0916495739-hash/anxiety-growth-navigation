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
  if (content.trim().length > 2000) {
    return res.status(422).json({ error: '意見回饋最多 2000 字' });
  }
  try {
    await pool.query(
      'INSERT INTO feedback (user_id, content) VALUES ($1, $2)',
      [req.userId, content.trim()]
    );
    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '提交失敗，請稍後再試' });
  }
});

module.exports = router;
