import api from './api';

export const transportPlanService = {
  /**
   * Fetch all transport plans with optional query filters
   * Query params: { status, truckId, warehouseId }
   */
  async getAllTransportPlans(params = {}) {
    const res = await api.get('/api/transport-plans', { params });
    return res.data || [];
  },

  /**
   * Fetch single transport plan by ID
   */
  async getTransportPlanById(id) {
    const res = await api.get(`/api/transport-plans/${id}`);
    return res.data;
  },

  /**
   * Create transport plan
   */
  async createTransportPlan(planData) {
    const res = await api.post('/api/transport-plans', planData);
    return res.data;
  },

  /**
   * Update transport plan status
   * Allowed transitions:
   * PLANNED -> IN_PROGRESS, CANCELLED
   * IN_PROGRESS -> COMPLETED, CANCELLED
   */
  async updateTransportPlanStatus(id, status) {
    const res = await api.patch(`/api/transport-plans/${id}/status`, { status });
    return res.data;
  },
};

export default transportPlanService;
