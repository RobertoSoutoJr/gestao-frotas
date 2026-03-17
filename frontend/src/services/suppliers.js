import api from './api';

export const suppliersService = {
  getAll: () => api.get('/fornecedores'),
  getById: (id) => api.get(`/fornecedores/${id}`),
  create: (data) => api.post('/fornecedores', data),
  update: (id, data) => api.put(`/fornecedores/${id}`, data),
  delete: (id) => api.delete(`/fornecedores/${id}`)
};
