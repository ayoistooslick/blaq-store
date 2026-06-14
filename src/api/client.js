import axios from 'axios';

const client = axios.create({
  baseURL: 'https://blaq-store-backend.onrender.com/api',
});

client.interceptors.request.use((config) => {
  const token = localStorage.getItem('blaq_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default client;
