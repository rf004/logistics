import api from './api';

export const roadService = {
  async getAllRoads() {
    const res = await api.get('/api/roads');
    return res.data || [];
  },

  async getRoadById(id) {
    const res = await api.get(`/api/roads/${id}`);
    return res.data;
  },

  async createRoad(roadData) {
    const res = await api.post('/api/roads', roadData);
    return res.data;
  },

  async updateRoad(id, roadData) {
    const res = await api.put(`/api/roads/${id}`, roadData);
    return res.data;
  },

  async deleteRoad(id) {
    const res = await api.delete(`/api/roads/${id}`);
    return res;
  },
};

export default roadService;
