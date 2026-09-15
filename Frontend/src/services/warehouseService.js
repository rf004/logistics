import api from './api';

export const warehouseService = {
  async getAllWarehouses() {
    const res = await api.get('/api/warehouses');
    return res.data || [];
  },

  async getWarehouseById(id) {
    const res = await api.get(`/api/warehouses/${id}`);
    return res.data;
  },

  async createWarehouse(warehouseData) {
    const res = await api.post('/api/warehouses', warehouseData);
    return res.data;
  },

  async updateWarehouse(id, warehouseData) {
    const res = await api.put(`/api/warehouses/${id}`, warehouseData);
    return res.data;
  },

  async deleteWarehouse(id) {
    const res = await api.delete(`/api/warehouses/${id}`);
    return res;
  },
};

export default warehouseService;
