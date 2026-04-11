import client from './client';

export const saveCognitiveRecord = (data) => client.post('/cognitive', data);
export const getCognitiveRecords = () => client.get('/cognitive');
export const deleteCognitiveRecord = (id) => client.delete(`/cognitive/${id}`);
