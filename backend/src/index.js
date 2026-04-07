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

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://eloquent-reflection-production-da94.up.railway.app',
  ],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/emotions', emotionsRoutes);
app.use('/api/achievements', achievementsRoutes);
app.use('/api/conflicts', conflictsRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/feedback', feedbackRoutes);

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
