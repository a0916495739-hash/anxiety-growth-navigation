const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

async function resolveUserId(req, res) {
  if (req.userId) return req.userId;
  const result = await pool.query('SELECT id FROM users WHERE guest_token = $1', [req.guestToken]);
  if (result.rows.length === 0) {
    res.status(401).json({ error: 'Invalid guest token' });
    return null;
  }
  return result.rows[0].id;
}

// POST /api/achievements
router.post('/', auth, async (req, res) => {
  const { title, my_standard } = req.body;

  if (!title?.trim()) {
    return res.status(422).json({ error: 'title is required' });
  }

  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      'INSERT INTO achievements (user_id, title, my_standard) VALUES ($1, $2, $3) RETURNING *',
      [userId, title, my_standard || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save achievement' });
  }
});

// GET /api/achievements
router.get('/', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      'SELECT * FROM achievements WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch achievements' });
  }
});

// DELETE /api/achievements/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      'DELETE FROM achievements WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
