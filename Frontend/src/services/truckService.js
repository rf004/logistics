import api from './api';

export const truckService = {
  async getAllTrucks() {
    const res = await api.get('/api/trucks');
    return res.data || [];
  },

  async getTruckById(id) {
    const res = await api.get(`/api/trucks/${id}`);
    return res.data;
  },

  async createTruck(truckData) {
    const res = await api.post('/api/trucks', truckData);
    return res.data;
  },

  async updateTruck(id, truckData) {
    const res = await api.put(`/api/trucks/${id}`, truckData);
    return res.data;
  },

  async deleteTruck(id) {
    const res = await api.delete(`/api/trucks/${id}`);
    return res;
  },
};

export default truckService;
