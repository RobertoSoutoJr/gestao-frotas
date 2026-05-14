import api from './api';

export const postosService = {
  getAll: () => api.get('/postos'),
  getById: (id) => api.get(`/postos/${id}`),
  create: (data) => api.post('/postos', data),
  update: (id, data) => api.put(`/postos/${id}`, data),
  delete: (id) => api.delete(`/postos/${id}`)
};
