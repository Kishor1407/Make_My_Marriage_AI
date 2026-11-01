import axios from 'axios';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  withCredentials: true, // Crucial for sending/receiving HTTP-Only JWT cookies
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor to format errors gracefully
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const customError =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';
    return Promise.reject(new Error(customError));
  }
);

export default api;

