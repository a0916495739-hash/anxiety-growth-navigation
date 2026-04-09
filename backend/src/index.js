require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const runMigrations = require('./db/migrate');

const authRoutes = require('./routes/auth');
const emotionsRoutes = require('./routes/emotions');
const achievementsRoutes = require('./routes/achievements');
const conflictsRoutes = require('./routes/conflicts');
const statsRoutes = require('./routes/stats');
const feedbackRoutes = require('./routes/feedback');
const communityRoutes = require('./routes/community');

if (!process.env.JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set');
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : [
      'http://localhost:5173',
      'https://eloquent-reflection-production-da94.up.railway.app',
      process.env.FRONTEND_URL,
    ].filter(Boolean);

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/emotions', emotionsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/conflicts', conflictsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/community', communityRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

async function start() {
  await runMigrations();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
