import client from './client';

export const createConflict = (data) => client.post('/conflicts', data);
export const getConflicts = () => client.get('/conflicts');
export const getConflictStats = () => client.get('/conflicts/stats');
export const deleteConflict = (id) => client.delete(`/conflicts/${id}`);
export const resolveConflict = (id) => client.put(`/conflicts/${id}/resolve`);
