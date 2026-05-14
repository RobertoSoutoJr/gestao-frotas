import api from './api';

export const oficinasService = {
  getAll: () => api.get('/oficinas'),
  getById: (id) => api.get(`/oficinas/${id}`),
  create: (data) => api.post('/oficinas', data),
  update: (id, data) => api.put(`/oficinas/${id}`, data),
  delete: (id) => api.delete(`/oficinas/${id}`)
};
