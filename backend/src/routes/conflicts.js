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

// POST /api/conflicts
router.post('/', auth, async (req, res) => {
  const { should_content, want_content, source, feeling_tags, chosen } = req.body;

  if (!should_content?.trim()) return res.status(422).json({ error: 'should_content is required' });
  if (!want_content?.trim()) return res.status(422).json({ error: 'want_content is required' });
  if (should_content.length > 500) return res.status(422).json({ error: 'should_content 最多 500 字' });
  if (want_content.length > 500) return res.status(422).json({ error: 'want_content 最多 500 字' });
  if (!['family', 'peers', 'society', 'self'].includes(source)) {
    return res.status(422).json({ error: 'source must be one of: family, peers, society, self' });
  }
  if (chosen && !['should', 'want', 'neither', 'pending'].includes(chosen)) {
    return res.status(422).json({ error: 'chosen must be one of: should, want, neither, pending' });
  }

  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      `INSERT INTO conflicts (user_id, should_content, want_content, source, feeling_tags, chosen)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, should_content, want_content, source, feeling_tags || [], chosen || 'pending']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save conflict' });
  }
});

// GET /api/conflicts/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      `SELECT source, COUNT(*) as count
       FROM conflicts WHERE user_id = $1
       GROUP BY source`,
      [userId]
    );

    const stats = { family: 0, peers: 0, society: 0, self: 0 };
    for (const row of result.rows) {
      stats[row.source] = parseInt(row.count, 10);
    }
    res.json(stats);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// GET /api/conflicts
router.get('/', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      'SELECT * FROM conflicts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch conflicts' });
  }
});

// PUT /api/conflicts/:id/resolve
router.put('/:id/resolve', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;
    const result = await pool.query(
      `UPDATE conflicts SET resolved_at = NOW() WHERE id = $1 AND user_id = $2 RETURNING id, resolved_at`,
      [req.params.id, userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to resolve' });
  }
});

// DELETE /api/conflicts/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = await resolveUserId(req, res);
    if (!userId) return;

    const result = await pool.query(
      'DELETE FROM conflicts WHERE id = $1 AND user_id = $2 RETURNING id',
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
