import api from './api';

export const processEngineService = {
  /**
   * Trigger backend logistics processing engine
   * Response: { statusCode: 200, data: ProcessResult, message: string }
   */
  async processFarms() {
    const res = await api.post('/api/process/process-farms');
    return res.data;
  },
};

export default processEngineService;
