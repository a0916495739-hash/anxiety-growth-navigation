import client from './client';

export const getWeeklyStats = () => client.get('/stats');
