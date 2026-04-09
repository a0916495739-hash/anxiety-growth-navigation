import client from './client';
export const logBreathingSession = (pattern_id, duration_seconds) =>
  client.post('/breathing', { pattern_id, duration_seconds });
export const getBreathingSessions = () => client.get('/breathing');
