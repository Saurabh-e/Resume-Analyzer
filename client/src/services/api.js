import axios from 'axios';

/**
 * Axios instance with base configuration
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor to add auth token
 */
api.interceptors.request.use(
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

/**
 * Response interceptor to handle errors
 */
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred';

    // Handle 401 Unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    return Promise.reject({ message, ...error.response?.data });
  }
);

/**
 * Auth API
 */
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
};

/**
 * Resume API
 */
export const resumeAPI = {
  upload: (formData) =>
    api.post('/resumes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: (params) => api.get('/resumes', { params }),
  getById: (id) => api.get(`/resumes/${id}`),
  delete: (id) => api.delete(`/resumes/${id}`),
  getStats: () => api.get('/resumes/stats'),
};

/**
 * Analysis API
 */
export const analysisAPI = {
  analyze: (resumeId, data) => api.post(`/analysis/analyze/${resumeId}`, data),
  getAll: (params) => api.get('/analysis', { params }),
  getById: (id) => api.get(`/analysis/${id}`),
  getInterviewQuestions: (id) => api.post(`/analysis/${id}/interview-questions`),
  getCareerRecommendations: (id) => api.post(`/analysis/${id}/career-recommendations`),
  getSkillGap: (id) => api.post(`/analysis/${id}/skill-gap`),
  rewrite: (data) => api.post('/analysis/rewrite', data),
  delete: (id) => api.delete(`/analysis/${id}`),
};

/**
 * Dashboard API
 */
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getAdmin: () => api.get('/dashboard/admin'),
  getAllUsers: (params) => api.get('/dashboard/admin/users', { params }),
  toggleUserStatus: (id) => api.put(`/dashboard/admin/users/${id}/toggle-status`),
  deleteUser: (id) => api.delete(`/dashboard/admin/users/${id}`),
};

export default api;
