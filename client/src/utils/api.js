import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add auth token to requests
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

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me')
};

export const meetingAPI = {
  create: (data) => api.post('/meetings/create', data),
  get: (meetingId) => api.get(`/meetings/${meetingId}`),
  validate: (meetingId, passcode) => api.post(`/meetings/${meetingId}/validate`, { passcode }),
  getUserMeetings: () => api.get('/meetings/user/meetings')
};

export default api;
