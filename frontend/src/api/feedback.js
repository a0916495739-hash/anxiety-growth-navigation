import client from './client';

export const submitFeedback = (content) => client.post('/feedback', { content });
