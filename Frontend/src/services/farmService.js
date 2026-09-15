import api from './api';

export const farmService = {
  /**
   * Fetch all farms
   * Response: { success: true, count: number, data: Farm[] }
   */
  async getAllFarms() {
    const res = await api.get('/api/farms');
    return res.data || [];
  },

  /**
   * Fetch farm by ID
   * Response: { success: true, statusCode: 200, data: Farm, message: string }
   */
  async getFarmById(id) {
    const res = await api.get(`/api/farms/${id}`);
    return res.data;
  },

  /**
   * Create a new farm
   */
  async createFarm(farmData) {
    const res = await api.post('/api/farms', farmData);
    return res.data;
  },

  /**
   * Update an existing farm
   */
  async updateFarm(id, farmData) {
    const res = await api.put(`/api/farms/${id}`, farmData);
    return res.data;
  },

  /**
   * Delete a farm
   */
  async deleteFarm(id) {
    const res = await api.delete(`/api/farms/${id}`);
    return res;
  },
};

export default farmService;
