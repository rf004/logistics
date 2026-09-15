import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Response interceptor for consistent data & error extraction
api.interceptors.response.use(
  (response) => {
    // Return standard response data if wrapped in ApiResponse
    return response.data;
  },
  (error) => {
    let message = 'An unexpected server error occurred. Please try again.';
    let errors = [];

    if (error.response) {
      const data = error.response.data;
      if (data && data.message) {
        message = data.message;
      }
      if (data && Array.isArray(data.errors)) {
        errors = data.errors;
      }
    } else if (error.request) {
      message = 'Unable to reach the backend server. Please verify the backend is running at ' + API_BASE_URL;
    } else if (error.message) {
      message = error.message;
    }

    const enhancedError = new Error(message);
    enhancedError.statusCode = error.response?.status || 500;
    enhancedError.errors = errors;
    enhancedError.raw = error;

    return Promise.reject(enhancedError);
  }
);

export default api;
export { API_BASE_URL };
