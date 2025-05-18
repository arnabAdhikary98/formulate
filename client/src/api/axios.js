import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create a custom axios instance with optimized settings
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000, // 10 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Do something with request error
    return Promise.reject(error);
  }
);

// Add a response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    // Add cache headers for efficient client-side caching
    if (error.response) {
      // Server responded with non 2xx status code
      if (error.response.status === 401) {
        // Handle 401 Unauthorized - could redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        // window.location.href = '/login';
      }
      return Promise.reject(error.response);
    } else if (error.request) {
      // No response was received - possibly network error
      console.error('Network Error:', error.request);
      return Promise.reject({ data: { message: 'Network error. Please check your connection.' } });
    } else {
      // Something happened in setting up the request
      console.error('Error:', error.message);
      return Promise.reject({ data: { message: error.message } });
    }
  }
);

export default api; 