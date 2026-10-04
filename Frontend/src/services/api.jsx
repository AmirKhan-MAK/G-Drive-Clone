import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:9090', //APi-Gateway's port
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); // Token browser ki memory se nikala
  if (token) {
    config.headers.Authorization = `Bearer ${token}`; // Backend ko bata diya ki main valid user hu
  }
  return config;
});

export default api;