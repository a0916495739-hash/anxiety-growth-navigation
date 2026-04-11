const express = require('express');
const pool = require('../db/pool');
const auth = require('../middleware/auth');

const router = express.Router();

// POST /api/cognitive
router.post('/', auth, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Login required' });

  const { situation, auto_thought, evidence, balanced_thought } = req.body;

  if (!situation?.trim())        return res.status(422).json({ error: 'situation is required' });
  if (!auto_thought?.trim())     return res.status(422).json({ error: 'auto_thought is required' });
  if (!evidence?.trim())         return res.status(422).json({ error: 'evidence is required' });
  if (!balanced_thought?.trim()) return res.status(422).json({ error: 'balanced_thought is required' });

  try {
    const result = await pool.query(
      `INSERT INTO cognitive_records (user_id, situation, auto_thought, evidence, balanced_thought)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.userId, situation.trim(), auto_thought.trim(), evidence.trim(), balanced_thought.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to save record' });
  }
});

// GET /api/cognitive
router.get('/', auth, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Login required' });

  try {
    const result = await pool.query(
      'SELECT * FROM cognitive_records WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch records' });
  }
});

// DELETE /api/cognitive/:id
router.delete('/:id', auth, async (req, res) => {
  if (!req.userId) return res.status(401).json({ error: 'Login required' });

  try {
    const result = await pool.query(
      'DELETE FROM cognitive_records WHERE id = $1 AND user_id = $2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Record not found' });
    res.json({ message: 'Deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to delete' });
  }
});

module.exports = router;
