import api from './api';

export const driversService = {
  getAll: () => api.get('/motoristas'),
  getById: (id) => api.get(`/motoristas/${id}`),
  create: (data) => api.post('/motoristas', data),
  update: (id, data) => api.put(`/motoristas/${id}`, data),
  delete: (id) => api.delete(`/motoristas/${id}`)
};
