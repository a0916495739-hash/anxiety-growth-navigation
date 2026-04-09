const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

async function resolveUserId(req, res) {
  if (req.userId) return req.userId;
  const result = await pool.query('SELECT id FROM users WHERE guest_token = $1', [req.guestToken]);
  if (result.rows.length === 0) { res.status(401).json({ error: 'Invalid guest token' }); return null; }
  return result.rows[0].id;
}

// POST /api/breathing — log a completed session
router.post('/', auth, async (req, res) => {
  const { pattern_id, duration_seconds } = req.body;
  if (!pattern_id || !duration_seconds) return res.status(422).json({ error: 'pattern_id and duration_seconds required' });
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;
    const r = await pool.query(
      'INSERT INTO breathing_sessions (user_id, pattern_id, duration_seconds) VALUES ($1, $2, $3) RETURNING *',
      [userId, pattern_id, parseInt(duration_seconds)]
    );
    res.status(201).json(r.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to log session' });
  }
});

// GET /api/breathing — recent sessions
router.get('/', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;
    const r = await pool.query(
      'SELECT id, pattern_id, duration_seconds, completed_at FROM breathing_sessions WHERE user_id = $1 ORDER BY completed_at DESC LIMIT 20',
      [userId]
    );
    res.json(r.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

module.exports = router;
