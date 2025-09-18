import axios from 'axios';

// For Android emulator use 10.0.2.2
// For physical phone use your computer's IP (e.g. http://192.168.1.5:5000/api)
const API_BASE = 'http://10.0.2.2:5000/api';

export const register = (payload) => axios.post(`${API_BASE}/auth/register`, payload);
export const login = (payload) => axios.post(`${API_BASE}/auth/login`, payload);
export const me = (token) =>
  axios.get(`${API_BASE}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  });
