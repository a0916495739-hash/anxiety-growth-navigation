const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const pool = require('../db/pool');

const isProd = process.env.NODE_ENV === 'production';
const cookieOptions = {
  httpOnly: true,
  sameSite: isProd ? 'None' : 'lax',
  secure: isProd,
  maxAge: 30 * 24 * 60 * 60 * 1000,
};

function createMailer() {
  const nodemailer = require('nodemailer');
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

const router = express.Router();

// POST /api/auth/guest
router.post('/guest', async (req, res) => {
  try {
    const guestToken = uuidv4();
    const result = await pool.query(
      'INSERT INTO users (guest_token) VALUES ($1) RETURNING guest_token',
      [guestToken]
    );
    res.status(201).json({ guest_token: result.rows[0].guest_token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create guest session' });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  const { email, password } = req.body;
  const guestToken = req.headers['x-guest-token'];

  if (!email || !password) {
    return res.status(422).json({ error: 'Email and password are required' });
  }
  if (password.length < 8) {
    return res.status(422).json({ error: 'Password must be at least 8 characters' });
  }

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const existing = await client.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const userResult = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id',
      [email, passwordHash]
    );
    const newUserId = userResult.rows[0].id;

    // Migrate guest data if guest_token provided
    if (guestToken) {
      const guestUser = await client.query(
        'SELECT id FROM users WHERE guest_token = $1',
        [guestToken]
      );
      if (guestUser.rows.length > 0) {
        const guestUserId = guestUser.rows[0].id;
        await client.query('UPDATE emotion_records SET user_id = $1 WHERE user_id = $2', [newUserId, guestUserId]);
        await client.query('UPDATE achievements SET user_id = $1 WHERE user_id = $2', [newUserId, guestUserId]);
        await client.query('UPDATE conflicts SET user_id = $1 WHERE user_id = $2', [newUserId, guestUserId]);
        await client.query('DELETE FROM users WHERE id = $1', [guestUserId]);
      }
    }

    await client.query('COMMIT');

    const token = jwt.sign({ userId: newUserId }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.cookie('token', token, cookieOptions);
    res.status(201).json({ message: 'Account created successfully' });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Registration failed' });
  } finally {
    client.release();
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(422).json({ error: 'Email and password are required' });
  }

  try {
    const result = await pool.query('SELECT id, password_hash FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.cookie('token', token, cookieOptions);
    res.json({ message: 'Logged in successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query(
      'SELECT id, email, display_name FROM users WHERE id = $1',
      [payload.userId]
    );
    if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });
    res.json({
      userId: payload.userId,
      email: result.rows[0].email,
      displayName: result.rows[0].display_name || null,
    });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// PUT /api/auth/profile
router.put('/profile', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  const { display_name } = req.body;
  if (!display_name?.trim()) {
    return res.status(422).json({ error: '顯示名稱不能為空' });
  }
  if (display_name.trim().length > 30) {
    return res.status(422).json({ error: '顯示名稱最多 30 個字元' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    await pool.query(
      'UPDATE users SET display_name = $1 WHERE id = $2',
      [display_name.trim(), payload.userId]
    );
    res.json({ displayName: display_name.trim() });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// PUT /api/auth/password
router.put('/password', async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: 'Not logged in' });
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(422).json({ error: '請填寫目前密碼和新密碼' });
  }
  if (newPassword.length < 8) {
    return res.status(422).json({ error: '新密碼至少需要 8 個字元' });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const result = await pool.query('SELECT password_hash FROM users WHERE id = $1', [payload.userId]);
    if (result.rows.length === 0) return res.status(401).json({ error: 'User not found' });
    const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
    if (!valid) return res.status(401).json({ error: '目前密碼不正確' });
    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, payload.userId]);
    res.json({ message: 'Password updated' });
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
});

// POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(422).json({ error: 'Email 為必填' });

  try {
    const result = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

    // 不透露帳號是否存在（防止帳號枚舉）
    if (result.rows.length === 0) {
      return res.json({ message: '若此 Email 已註冊，重設連結將發送至信箱' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 小時後過期

    await pool.query(
      'UPDATE users SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [token, expires, result.rows[0].id]
    );

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    const resetUrl = `${frontendUrl}/reset-password?token=${token}`;

    if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
      console.log('\n📧 [DEV] 密碼重設連結：', resetUrl, '\n');
      return res.json({ message: '若此 Email 已註冊，重設連結將發送至信箱', devResetUrl: resetUrl });
    } else {
      const mailer = createMailer();
      await mailer.sendMail({
        from: `"抗焦慮成長導航" <${process.env.SMTP_USER}>`,
        to: email,
        subject: '重設你的密碼',
        html: `
          <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#faf8f3;border-radius:16px">
            <h2 style="color:#2d3748;margin-bottom:8px">重設密碼</h2>
            <p style="color:#6b7280;line-height:1.7">你收到這封信，是因為有人請求重設與此 Email 關聯的密碼。</p>
            <p style="color:#6b7280;line-height:1.7">點擊下方按鈕，即可設定新密碼。連結將在 <strong>1 小時</strong>後失效。</p>
            <a href="${resetUrl}"
               style="display:inline-block;margin:24px 0;background:#7fb5a0;color:#fff;text-decoration:none;border-radius:10px;padding:12px 28px;font-weight:600;font-size:15px">
              重設密碼
            </a>
            <p style="color:#9ca3af;font-size:13px">如果你沒有請求重設密碼，請忽略此信，你的帳號不會有任何變動。</p>
            <hr style="border:none;border-top:1px solid #e8e0d0;margin:24px 0"/>
            <p style="color:#9ca3af;font-size:12px">抗焦慮成長導航</p>
          </div>
        `,
      });
    }

    res.json({ message: '若此 Email 已註冊，重設連結將發送至信箱' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '發送失敗，請稍後再試' });
  }
});

// POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  if (!token || !newPassword) {
    return res.status(422).json({ error: 'token 與新密碼為必填' });
  }
  if (newPassword.length < 8) {
    return res.status(422).json({ error: '新密碼至少需要 8 個字元' });
  }

  try {
    const result = await pool.query(
      'SELECT id FROM users WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );
    if (result.rows.length === 0) {
      return res.status(400).json({ error: '連結已失效或不正確，請重新申請' });
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [newHash, result.rows[0].id]
    );

    res.json({ message: '密碼已重設，請使用新密碼登入' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '重設失敗，請稍後再試' });
  }
});

// POST /api/auth/logout
router.post('/logout', (req, res) => {
  res.clearCookie('token', { ...cookieOptions, maxAge: undefined });
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;
