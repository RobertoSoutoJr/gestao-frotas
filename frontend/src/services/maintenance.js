import api from './api';

export const maintenanceService = {
  getAll: () => api.get('/manutencoes'),
  getById: (id) => api.get(`/manutencoes/${id}`),
  getByTruck: (truckId) => api.get(`/manutencoes/truck/${truckId}`),
  getStats: (truckId) => api.get(`/manutencoes/truck/${truckId}/stats`),
  create: (data) => api.post('/manutencoes', data)
};
