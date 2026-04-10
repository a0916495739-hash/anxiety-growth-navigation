const express = require('express');
const jwt = require('jsonwebtoken');
const pool = require('../db/pool');

const router = express.Router();

function getUser(req) {
  const token = req.cookies?.token || req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}

// GET /api/subscription — current plan info
router.get('/', async (req, res) => {
  const payload = getUser(req);
  if (!payload) return res.status(401).json({ error: 'Not logged in' });

  try {
    const r = await pool.query(
      'SELECT subscription_plan, subscription_expires_at FROM users WHERE id = $1',
      [payload.userId]
    );
    if (r.rows.length === 0) return res.status(404).json({ error: 'User not found' });

    const { subscription_plan, subscription_expires_at } = r.rows[0];

    // Treat as free if pro expired
    const isPro =
      subscription_plan === 'pro' &&
      (subscription_expires_at === null || new Date(subscription_expires_at) > new Date());

    res.json({
      plan: isPro ? 'pro' : 'free',
      expiresAt: subscription_expires_at,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch subscription' });
  }
});

// POST /api/subscription/activate — manually activate pro (for testing / webhook handler)
// In production wire this to your Stripe webhook
router.post('/activate', async (req, res) => {
  const payload = getUser(req);
  if (!payload) return res.status(401).json({ error: 'Not logged in' });

  const { plan, expires_at } = req.body; // 'pro' | 'free', ISO date string
  if (!['pro', 'free'].includes(plan)) return res.status(422).json({ error: 'Invalid plan' });

  try {
    await pool.query(
      'UPDATE users SET subscription_plan = $1, subscription_expires_at = $2 WHERE id = $3',
      [plan, expires_at || null, payload.userId]
    );
    res.json({ plan, expiresAt: expires_at || null });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update subscription' });
  }
});

module.exports = router;
