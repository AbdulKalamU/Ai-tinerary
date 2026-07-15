import axios from './axios';

export const syncCompanion = async (syncData) => {
  const response = await axios.post('/companion/sync', syncData);
  return response.data;
};
