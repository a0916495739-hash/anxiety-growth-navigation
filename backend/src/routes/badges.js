const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

const ALL_BADGES = ['FIRST_EMOTION', 'EMOTION_10', 'STREAK_7', 'FIRST_ACHIEVEMENT', 'FIRST_CONFLICT', 'FIRST_BREATHING', 'BREATHING_5'];

async function computeEarned(userId) {
  const earned = [];

  // Count-based badges (single query each)
  const [emoCount, achCount, conCount, brCount] = await Promise.all([
    pool.query('SELECT COUNT(*) FROM emotion_records WHERE user_id = $1', [userId]),
    pool.query('SELECT COUNT(*) FROM achievements WHERE user_id = $1', [userId]),
    pool.query('SELECT COUNT(*) FROM conflicts WHERE user_id = $1', [userId]),
    pool.query('SELECT COUNT(*) FROM breathing_sessions WHERE user_id = $1', [userId]),
  ]);

  const ec = parseInt(emoCount.rows[0].count);
  if (ec >= 1)  earned.push('FIRST_EMOTION');
  if (ec >= 10) earned.push('EMOTION_10');
  if (parseInt(achCount.rows[0].count) >= 1) earned.push('FIRST_ACHIEVEMENT');
  if (parseInt(conCount.rows[0].count) >= 1) earned.push('FIRST_CONFLICT');
  if (parseInt(brCount.rows[0].count) >= 1)  earned.push('FIRST_BREATHING');
  if (parseInt(brCount.rows[0].count) >= 5)  earned.push('BREATHING_5');

  // Streak check — get distinct days desc
  const days = await pool.query(
    `SELECT DISTINCT DATE(created_at AT TIME ZONE 'UTC') AS day
     FROM emotion_records WHERE user_id = $1
     ORDER BY day DESC LIMIT 30`,
    [userId]
  );
  if (days.rows.length >= 7) {
    const ONE_DAY = 86400000;
    const timestamps = days.rows.map((r) => new Date(r.day).getTime());
    let streak = 1, max = 1;
    for (let i = 0; i < timestamps.length - 1; i++) {
      streak = timestamps[i] - timestamps[i + 1] === ONE_DAY ? streak + 1 : 1;
      if (streak > max) max = streak;
    }
    if (max >= 7) earned.push('STREAK_7');
  }

  return earned;
}

// GET /api/badges — compute + persist badges, return all earned
router.get('/', async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Login required for badges' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.userId;

    const earned = await computeEarned(userId);

    // Upsert newly earned badges
    if (earned.length > 0) {
      const values = earned.map((_, i) => `($1, $${i + 2})`).join(', ');
      await pool.query(
        `INSERT INTO user_badges (user_id, badge_id) VALUES ${values} ON CONFLICT DO NOTHING`,
        [userId, ...earned]
      );
    }

    // Return all stored badges with timestamps
    const stored = await pool.query(
      'SELECT badge_id, earned_at FROM user_badges WHERE user_id = $1 ORDER BY earned_at',
      [userId]
    );

    res.json(stored.rows);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
