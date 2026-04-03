import client from './client';

export const createEmotion = (data) => client.post('/emotions', data);
export const getEmotions = () => client.get('/emotions');
export const getTodayCount = () => client.get('/emotions/today/count');
export const getEmotionTrend = () => client.get('/emotions/trend');
export const deleteEmotion = (id) => client.delete(`/emotions/${id}`);
