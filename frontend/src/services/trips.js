import api from './api';

export const tripsService = {
  getAll: () => api.get('/viagens'),
  getById: (id) => api.get(`/viagens/${id}`),
  create: (data) => api.post('/viagens', data),
  update: (id, data) => api.put(`/viagens/${id}`, data),
  finalize: (id, data) => api.patch(`/viagens/${id}/finalizar`, data),
  updateLocation: (id, field, lat, lng) => api.patch(`/viagens/${id}/location`, { field, lat, lng }),
  syncLocations: (items) => api.post('/viagens/sync-locations', { items }),
  delete: (id) => api.delete(`/viagens/${id}`),

  // Custos detalhados
  getCosts: (tripId) => api.get(`/viagens/${tripId}/custos`),
  getCostSummary: (tripId) => api.get(`/viagens/${tripId}/custos/resumo`),
  addCost: (tripId, data) => api.post(`/viagens/${tripId}/custos`, data),
  updateCost: (id, data) => api.put(`/viagens/custo/${id}`, data),
  deleteCost: (id) => api.delete(`/viagens/custo/${id}`),
};
