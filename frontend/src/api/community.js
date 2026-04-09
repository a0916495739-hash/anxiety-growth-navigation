import client from './client';

export const getCommunityPosts = () => client.get('/community');
export const submitCommunityPost = (content) => client.post('/community', { content });
export const hugPost = (id) => client.post(`/community/${id}/hug`);
