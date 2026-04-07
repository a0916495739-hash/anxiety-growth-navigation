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

// GET /api/stats/correlation
// 當某個來源的衝突發生時，同一天的平均情緒強度
router.get('/correlation', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      `SELECT
         c.source,
         ROUND(AVG(e.intensity)::numeric, 1)  AS avg_intensity,
         COUNT(DISTINCT e.id)::int             AS emotion_count,
         COUNT(DISTINCT c.id)::int             AS conflict_count
       FROM conflicts c
       JOIN emotion_records e
         ON  e.user_id = c.user_id
         AND date_trunc('day', e.created_at AT TIME ZONE 'UTC')
           = date_trunc('day', c.created_at AT TIME ZONE 'UTC')
         AND e.mode = 'guided'
         AND e.intensity IS NOT NULL
       WHERE c.user_id = $1
       GROUP BY c.source
       HAVING COUNT(DISTINCT e.id) > 0
       ORDER BY avg_intensity ASC`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch correlation' });
  }
});

// GET /api/stats/heatmap — 過去 84 天每日活動次數
router.get('/heatmap', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      `SELECT
         TO_CHAR(day, 'YYYY-MM-DD') AS day,
         count::int
       FROM (
         SELECT
           DATE(created_at AT TIME ZONE 'Asia/Taipei') AS day,
           COUNT(*) AS count
         FROM (
           SELECT created_at FROM emotion_records WHERE user_id = $1
           UNION ALL
           SELECT created_at FROM achievements    WHERE user_id = $1
           UNION ALL
           SELECT created_at FROM conflicts       WHERE user_id = $1
         ) all_records
         WHERE created_at >= NOW() - INTERVAL '84 days'
         GROUP BY day
       ) grouped
       ORDER BY day`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch heatmap' });
  }
});

module.exports = router;
