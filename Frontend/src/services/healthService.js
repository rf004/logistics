import api from './api';

export const healthService = {
  async checkHealth() {
    const startTime = performance.now();
    try {
      const res = await api.get('/api/health');
      const endTime = performance.now();
      return {
        online: true,
        latencyMs: Math.round(endTime - startTime),
        data: res,
      };
    } catch (err) {
      return {
        online: false,
        latencyMs: null,
        error: err.message,
      };
    }
  },
};

export default healthService;
