import axios from 'axios';
import { getApiUrl } from '../config';

// Create axios instance with base configuration
// In development, VITE_API_URL is empty and uses proxy
// In production, VITE_API_URL should be set to your backend URL
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false, // Set to true if using cookies
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
