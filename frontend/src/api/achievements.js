import client from './client';

export const createAchievement = (data) => client.post('/achievements', data);
export const getAchievements = () => client.get('/achievements');
export const deleteAchievement = (id) => client.delete(`/achievements/${id}`);
