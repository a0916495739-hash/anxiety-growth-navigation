import client from './client';

// Returns { enabled: true, message: "..." } or { enabled: false }
export const getAIEmotionFeedback = (text, lang) =>
  client.post('/ai/emotion-feedback', { text, lang });

// Returns cached report or { cached: false }
export const fetchWeeklyReport = () =>
  client.get('/ai/weekly-report');

// Generate (or return cached) weekly report
export const generateWeeklyReport = (lang) =>
  client.post('/ai/weekly-report', { lang });
