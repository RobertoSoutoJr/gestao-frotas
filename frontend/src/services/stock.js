import api from './api';

export const stockService = {
  getAll: () => api.get('/estoque'),
  getById: (id) => api.get(`/estoque/${id}`),
  create: (data) => api.post('/estoque', data),
  update: (id, data) => api.put(`/estoque/${id}`, data),
  markAsPaid: (id) => api.patch(`/estoque/${id}/pagar`),
  delete: (id) => api.delete(`/estoque/${id}`)
};
