import api from './api';

export const urgencyService = {
  /**
   * Fetch urgency calculation for all farms sorted by priority
   * Response: { success: true, count: number, data: UrgencyMetric[] }
   */
  async getAllFarmsUrgency() {
    const res = await api.get('/api/urgency/farms');
    return res.data || [];
  },

  /**
   * Fetch urgency calculation for single farm
   * Response: { success: true, data: UrgencyMetric }
   */
  async getFarmUrgency(id) {
    const res = await api.get(`/api/urgency/farms/${id}`);
    return res.data;
  },
};

export default urgencyService;
