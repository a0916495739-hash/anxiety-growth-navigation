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

// POST /api/emotions
router.post('/', auth, async (req, res) => {
  const { mode, intensity, trigger_event, protection, raw_emotion, reflection, emotion_tags } = req.body;

  if (!mode || !['guided', 'free'].includes(mode)) {
    return res.status(422).json({ error: 'mode must be "guided" or "free"' });
  }
  if (mode === 'guided' && (!intensity || intensity < 1 || intensity > 5)) {
    return res.status(422).json({ error: 'intensity (1-5) is required for guided mode' });
  }
  if (mode === 'free' && !raw_emotion?.trim()) {
    return res.status(422).json({ error: 'raw_emotion is required for free mode' });
  }
  if (trigger_event?.length > 500) return res.status(422).json({ error: 'trigger_event 最多 500 字' });
  if (protection?.length > 500) return res.status(422).json({ error: 'protection 最多 500 字' });
  if (raw_emotion?.length > 1000) return res.status(422).json({ error: 'raw_emotion 最多 1000 字' });
  if (reflection?.length > 1000) return res.status(422).json({ error: 'reflection 最多 1000 字' });

  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      `INSERT INTO emotion_records
        (user_id, mode, intensity, trigger_event, protection, raw_emotion, reflection, emotion_tags)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [userId, mode, intensity || null, trigger_event || null, protection || null,
       raw_emotion || null, reflection || null, emotion_tags || []]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save emotion record' });
  }
});

// GET /api/emotions/today/count
router.get('/today/count', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      `SELECT COUNT(*) FROM emotion_records
       WHERE user_id = $1
         AND created_at >= date_trunc('day', NOW() AT TIME ZONE 'UTC')`,
      [userId]
    );
    res.json({ count: parseInt(result.rows[0].count, 10) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to get count' });
  }
});

// GET /api/emotions
router.get('/', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      'SELECT * FROM emotion_records WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch emotion records' });
  }
});

// GET /api/emotions/trend — last 7 days average intensity per day
router.get('/trend', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      `SELECT
         date_trunc('day', created_at AT TIME ZONE 'UTC')::date AS day,
         ROUND(AVG(intensity)::numeric, 1) AS avg_intensity,
         COUNT(*) AS count
       FROM emotion_records
       WHERE user_id = $1
         AND created_at >= NOW() - INTERVAL '7 days'
         AND intensity IS NOT NULL
       GROUP BY day
       ORDER BY day ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch trend' });
  }
});

// DELETE /api/emotions/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      'DELETE FROM emotion_records WHERE id = $1 AND user_id = $2 RETURNING id',
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
