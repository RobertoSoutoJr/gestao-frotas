import api from './api';

export const fuelService = {
  getAll: () => api.get('/abastecimentos'),
  getById: (id) => api.get(`/abastecimentos/${id}`),
  getByTruck: (truckId) => api.get(`/abastecimentos/truck/${truckId}`),
  getConsumption: (truckId) => api.get(`/abastecimentos/truck/${truckId}/consumption`),
  create: (data) => api.post('/abastecimentos', data),
  update: (id, data) => api.put(`/abastecimentos/${id}`, data),
  delete: (id) => api.delete(`/abastecimentos/${id}`)
};
