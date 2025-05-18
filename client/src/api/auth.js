import api from './axios';

// Register a new user
export const register = async (userData) => {
  const response = await api.post('/users', userData);
  return response.data;
};

// Login user
export const login = async (credentials) => {
  const response = await api.post('/users/login', credentials);
  return response.data;
};

// Get user profile
export const getUserProfile = async () => {
  const response = await api.get('/users/profile');
  return response.data;
};

// Update user profile
export const updateUserProfile = async (userData) => {
  const response = await api.put('/users/profile', userData);
  return response.data;
}; 