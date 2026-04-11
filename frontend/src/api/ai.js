import client from './client';

// Returns { enabled: true, message: "..." } or { enabled: false }
export const getAIEmotionFeedback = (text, lang) =>
  client.post('/ai/emotion-feedback', { text, lang });
