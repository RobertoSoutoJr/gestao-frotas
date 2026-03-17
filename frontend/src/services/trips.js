import api from './api';

export const tripsService = {
  getAll: () => api.get('/viagens'),
  getById: (id) => api.get(`/viagens/${id}`),
  create: (data) => api.post('/viagens', data),
  update: (id, data) => api.put(`/viagens/${id}`, data),
  finalize: (id, data) => api.patch(`/viagens/${id}/finalizar`, data),
  delete: (id) => api.delete(`/viagens/${id}`)
};
