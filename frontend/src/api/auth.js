import client from './client';

export const createGuestSession = () => client.post('/auth/guest');
export const register = (email, password) => client.post('/auth/register', { email, password });
export const login = (email, password) => client.post('/auth/login', { email, password });
export const logout = () => client.post('/auth/logout');
export const getMe = () => client.get('/auth/me');
export const changePassword = (currentPassword, newPassword) =>
  client.put('/auth/password', { currentPassword, newPassword });
export const updateProfile = (displayName) =>
  client.put('/auth/profile', { display_name: displayName });
export const forgotPassword = (email) =>
  client.post('/auth/forgot-password', { email });
export const resetPassword = (token, newPassword) =>
  client.post('/auth/reset-password', { token, newPassword });
