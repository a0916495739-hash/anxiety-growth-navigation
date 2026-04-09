const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

function escapeCell(val) {
  if (val === null || val === undefined) return '';
  const s = Array.isArray(val) ? val.join('; ') : String(val);
  return s.includes(',') || s.includes('"') || s.includes('\n')
    ? `"${s.replace(/"/g, '""')}"`
    : s;
}

function toCSVRow(cells) {
  return cells.map(escapeCell).join(',');
}

// GET /api/export/csv
router.get('/csv', async (req, res) => {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ error: 'Login required' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.userId;

    const [emotions, achievements, conflicts] = await Promise.all([
      pool.query(
        `SELECT created_at, mode, intensity, emotion_tags, raw_emotion, trigger_event, protection, reflection
         FROM emotion_records WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT created_at, title, my_standard FROM achievements WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      ),
      pool.query(
        `SELECT created_at, should_content, want_content, source, feeling_tags, chosen, resolved_at
         FROM conflicts WHERE user_id = $1 ORDER BY created_at DESC`,
        [userId]
      ),
    ]);

    const lines = [];

    // Emotions section
    lines.push('# EMOTION RECORDS');
    lines.push(toCSVRow(['date', 'mode', 'intensity', 'emotion_tags', 'raw_emotion', 'trigger_event', 'protection', 'reflection']));
    emotions.rows.forEach((r) => {
      lines.push(toCSVRow([r.created_at, r.mode, r.intensity, r.emotion_tags, r.raw_emotion, r.trigger_event, r.protection, r.reflection]));
    });

    lines.push('');

    // Achievements section
    lines.push('# ACHIEVEMENTS');
    lines.push(toCSVRow(['date', 'title', 'my_standard']));
    achievements.rows.forEach((r) => {
      lines.push(toCSVRow([r.created_at, r.title, r.my_standard]));
    });

    lines.push('');

    // Conflicts section
    lines.push('# CONFLICTS');
    lines.push(toCSVRow(['date', 'should', 'want', 'source', 'feeling_tags', 'chosen', 'resolved_at']));
    conflicts.rows.forEach((r) => {
      lines.push(toCSVRow([r.created_at, r.should_content, r.want_content, r.source, r.feeling_tags, r.chosen, r.resolved_at]));
    });

    const csv = lines.join('\n');
    const filename = `anxiety-navigator-${new Date().toISOString().slice(0, 10)}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send('\uFEFF' + csv); // BOM for Excel UTF-8 compatibility
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
});

module.exports = router;
