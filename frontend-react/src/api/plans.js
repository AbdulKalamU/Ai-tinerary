import api from './axios';

export const generatePlan = async (data) => {
  try {
    const response = await api.post('/generate-plan', data);
    return response.data;
  } catch (err) {
    // Demo Mode Fallback: if the backend is offline, return a fake generated plan
    if (!err.response || err.message === 'Network Error' || localStorage.getItem('token') === 'demo-fake-jwt-token') {
      console.log('Backend offline or in Demo Mode: Returning mock generated plan');
      return getMockGeneratedPlan(data);
    }
    throw err;
  }
};

export const getAllPlans = async () => {
  try {
    const response = await api.get('/travel-plans');
    return response.data;
  } catch (err) {
    if (!err.response || localStorage.getItem('token') === 'demo-fake-jwt-token') {
      return { plans: [], total: 0 };
    }
    throw err;
  }
};

export const getPlanById = async (id) => {
  try {
    const response = await api.get(`/travel-plans/${id}`);
    return response.data;
  } catch (err) {
    if (!err.response || localStorage.getItem('token') === 'demo-fake-jwt-token') {
      if (id === 'demo-123') return getMockGeneratedPlan({ destination: 'Tokyo, Japan', startDate: '2026-10-01', endDate: '2026-10-05', groupType: 'Couple' });
      return getMockGeneratedPlan({ destination: 'Unknown Destination', startDate: '2026-08-01', endDate: '2026-08-03' });
    }
    throw err;
  }
};

export const deletePlan = async (id) => {
  try {
    const response = await api.delete(`/travel-plans/${id}`);
    return response.data;
  } catch (err) {
    if (!err.response || localStorage.getItem('token') === 'demo-fake-jwt-token') return { success: true };
    throw err;
  }
};

// Auto-save endpoint for reordering activities
export const reorderActivities = async (dayId, activityIds) => {
  try {
    const response = await api.put(`/days/${dayId}/reorder`, activityIds);
    return response.data;
  } catch (err) {
    if (!err.response || localStorage.getItem('token') === 'demo-fake-jwt-token') return { success: true };
    throw err;
  }
};

// Helper to generate a realistic looking fake JSON response for the demo
function getMockGeneratedPlan(requestData) {
  const tripDays = Math.max(1, Math.ceil((new Date(requestData.endDate) - new Date(requestData.startDate)) / (1000 * 60 * 60 * 24)));
  
  const mockAiResponse = {
    overview: `A fantastic trip to ${requestData.destination}. You will experience the best of local culture, food, and sightseeing tailored exactly for your preferences.`,
    bestTimeToVisit: "Spring or Autumn",
    language: "Local Language",
    currency: "Local Currency ($/€/¥)",
    weatherDuringTrip: "Mild and pleasant, around 20°C (68°F)",
    budgetEstimate: {
      budget: "$50-80/day",
      mid: "$150-250/day",
      luxury: "$500+/day"
    },
    days: Array.from({ length: tripDays }).map((_, i) => ({
      day: i + 1,
      title: `Exploring the heart of ${requestData.destination}`,
      activities: [
        {
          time: "09:00 AM",
          name: "Morning City Tour",
          description: "Start your day with a guided walk through the most historic parts of the city.",
          category: "sightseeing",
          estimatedCost: "$25",
          duration: "3 hours",
          tips: "Wear comfortable walking shoes.",
          imageKeyword: `${requestData.destination} landmark`,
          location: { lat: 35.6762 + (i * 0.01), lng: 139.6503 + (i * 0.01), name: "City Center" }
        },
        {
          time: "01:00 PM",
          name: "Lunch at a Local Favorite",
          description: "Enjoy traditional dishes at a highly-rated local restaurant.",
          category: "food",
          estimatedCost: "$30",
          duration: "1.5 hours",
          tips: "Try the house specialty.",
          imageKeyword: `${requestData.destination} food`,
          location: { lat: 35.6812 + (i * 0.01), lng: 139.6603 + (i * 0.01), name: "Local Market" }
        },
        {
          time: "03:30 PM",
          name: "Museum Visit or Adventure",
          description: "Spend your afternoon immersing yourself in local culture or taking an exciting adventure.",
          category: "cultural",
          estimatedCost: "$20",
          duration: "2 hours",
          tips: "Book tickets online to skip the line.",
          imageKeyword: `${requestData.destination} museum`,
          location: { lat: 35.6862 + (i * 0.01), lng: 139.6703 + (i * 0.01), name: "National Museum" }
        }
      ]
    })),
    packingTips: ["Comfortable walking shoes", "Universal power adapter", "Light jacket for evenings", "Camera"],
    localPhrases: [
      { phrase: "Hello", meaning: "Greeting", pronunciation: "heh-loh" },
      { phrase: "Thank you", meaning: "Expressing gratitude", pronunciation: "thangk-yoo" }
    ],
    foodRecommendations: [
      { name: "Local Street Food", description: "Delicious and authentic quick bites.", priceRange: "$5-10" },
      { name: "Signature Dish", description: "The famous dish everyone talks about.", priceRange: "$20-40" }
    ],
    safetyTips: ["Keep valuables secure in crowded areas", "Use official taxis or rideshare apps"]
  };

  return {
    id: 'demo-123',
    destination: requestData.destination,
    startDate: requestData.startDate,
    endDate: requestData.endDate,
    groupType: requestData.groupType || 'General',
    activities: requestData.activities ? requestData.activities.join(', ') : '',
    aiResponse: JSON.stringify(mockAiResponse),
    createdAt: new Date().toISOString()
  };
}
