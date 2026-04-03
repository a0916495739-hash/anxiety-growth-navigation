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

// GET /api/stats — weekly summary for homepage
router.get('/', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const [emotions, achievements, conflicts] = await Promise.all([
      pool.query(
        `SELECT COUNT(*) FROM emotion_records
         WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) FROM achievements
         WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
        [userId]
      ),
      pool.query(
        `SELECT COUNT(*) FROM conflicts
         WHERE user_id = $1 AND created_at >= NOW() - INTERVAL '7 days'`,
        [userId]
      ),
    ]);

    res.json({
      emotions: parseInt(emotions.rows[0].count, 10),
      achievements: parseInt(achievements.rows[0].count, 10),
      conflicts: parseInt(conflicts.rows[0].count, 10),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

module.exports = router;
