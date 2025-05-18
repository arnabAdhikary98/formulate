import { register, login, getUserProfile, updateUserProfile } from '../api/auth';
import api from '../api/axios';

// Mock the axios module
jest.mock('../api/axios', () => ({
  post: jest.fn(),
  get: jest.fn(),
  put: jest.fn(),
}));

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('register should call the correct endpoint with user data', async () => {
    const userData = { name: 'Test User', email: 'test@example.com', password: 'password123' };
    const mockResponse = { data: { token: 'test-token', user: { name: 'Test User' } } };
    
    api.post.mockResolvedValue(mockResponse);
    
    const result = await register(userData);
    
    expect(api.post).toHaveBeenCalledWith('/users', userData);
    expect(result).toEqual(mockResponse.data);
  });

  test('login should call the correct endpoint with credentials', async () => {
    const credentials = { email: 'test@example.com', password: 'password123' };
    const mockResponse = { data: { token: 'test-token', user: { name: 'Test User' } } };
    
    api.post.mockResolvedValue(mockResponse);
    
    const result = await login(credentials);
    
    expect(api.post).toHaveBeenCalledWith('/users/login', credentials);
    expect(result).toEqual(mockResponse.data);
  });

  test('getUserProfile should call the correct endpoint', async () => {
    const mockResponse = { data: { name: 'Test User', email: 'test@example.com' } };
    
    api.get.mockResolvedValue(mockResponse);
    
    const result = await getUserProfile();
    
    expect(api.get).toHaveBeenCalledWith('/users/profile');
    expect(result).toEqual(mockResponse.data);
  });

  test('updateUserProfile should call the correct endpoint with user data', async () => {
    const userData = { name: 'Updated User', email: 'updated@example.com' };
    const mockResponse = { data: { name: 'Updated User', email: 'updated@example.com' } };
    
    api.put.mockResolvedValue(mockResponse);
    
    const result = await updateUserProfile(userData);
    
    expect(api.put).toHaveBeenCalledWith('/users/profile', userData);
    expect(result).toEqual(mockResponse.data);
  });

  test('should handle API errors correctly', async () => {
    const error = new Error('Network Error');
    api.post.mockRejectedValue(error);
    
    await expect(register({})).rejects.toThrow('Network Error');
  });
}); 