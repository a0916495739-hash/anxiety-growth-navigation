import client from './client';

export const getWeeklyStats = () => client.get('/stats');
export const getCorrelation = () => client.get('/stats/correlation');
