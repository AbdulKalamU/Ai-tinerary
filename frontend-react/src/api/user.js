import api from './axios';

export const getProfile = async () => {
  const response = await api.get('/users/me');
  return response.data;
};

export const updateProfile = async (data) => {
  const response = await api.put('/users/me', data);
  return response.data;
};

export const changePassword = async (data) => {
  const response = await api.put('/users/me/password', data);
  return response.data;
};

export const getPreferences = async () => {
  const response = await api.get('/users/me/preferences');
  return response.data;
};

export const updatePreferences = async (data) => {
  const response = await api.put('/users/me/preferences', data);
  return response.data;
};
