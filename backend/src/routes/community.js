const express = require('express');
const pool = require('../db/pool');

const router = express.Router();

// GET /api/community — approved posts (newest first, max 30)
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, content, hug_count, created_at
       FROM community_posts
       WHERE approved = true
       ORDER BY created_at DESC
       LIMIT 30`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch posts' });
  }
});

// POST /api/community — submit a new post (pending approval)
router.post('/', async (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(422).json({ error: '內容不能為空' });
  }
  if (content.trim().length > 100) {
    return res.status(422).json({ error: '最多 100 個字' });
  }
  try {
    await pool.query(
      'INSERT INTO community_posts (content) VALUES ($1)',
      [content.trim()]
    );
    res.status(201).json({ message: 'ok' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to submit post' });
  }
});

// POST /api/community/:id/hug — add a hug
router.post('/:id/hug', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `UPDATE community_posts
       SET hug_count = hug_count + 1
       WHERE id = $1 AND approved = true
       RETURNING hug_count`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json({ hug_count: result.rows[0].hug_count });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to add hug' });
  }
});

module.exports = router;
