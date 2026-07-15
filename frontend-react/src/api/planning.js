import axios from './axios';

export const sendPlanningChatMessage = async (sessionId, message) => {
  const response = await axios.post('/planning/chat', {
    sessionId,
    message
  });
  return response.data;
};
