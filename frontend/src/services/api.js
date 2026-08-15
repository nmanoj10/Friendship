import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  timeout: 20000,
});

// Attach the stored auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('ft_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export function getErrorMessage(err, fallback = 'Something went wrong. Please try again.') {
  return err?.response?.data?.message || err?.message || fallback;
}

// Auth
export const register = (username, password) =>
  api.post('/api/auth/register', { username, password }).then((r) => r.data);
export const login = (username, password) =>
  api.post('/api/auth/login', { username, password }).then((r) => r.data);
export const getMe = () => api.get('/api/auth/me').then((r) => r.data);

// Tests
export const createTest = (payload) => api.post('/api/tests', payload).then((r) => r.data);
export const getPublicTest = (testCode) => api.get(`/api/tests/${testCode}`).then((r) => r.data);
export const getMyTests = () => api.get('/api/tests').then((r) => r.data);
export const claimTest = (dashboardToken) =>
  api.post('/api/tests/claim', { dashboardToken }).then((r) => r.data);

// Quiz flow
export const startAttempt = (testCode, participantName) =>
  api.post(`/api/tests/${testCode}/attempts`, { participantName }).then((r) => r.data);
export const submitAnswer = (testCode, attemptId, payload) =>
  api.post(`/api/tests/${testCode}/attempts/${attemptId}/answer`, payload).then((r) => r.data);
export const completeAttempt = (testCode, attemptId) =>
  api.post(`/api/tests/${testCode}/attempts/${attemptId}/complete`).then((r) => r.data);

// Dashboard
export const getDashboard = (dashboardToken) =>
  api.get(`/api/dashboard/${dashboardToken}`).then((r) => r.data);
export const getAttemptDetail = (dashboardToken, attemptId) =>
  api.get(`/api/dashboard/${dashboardToken}/attempts/${attemptId}`).then((r) => r.data);

export default api;
