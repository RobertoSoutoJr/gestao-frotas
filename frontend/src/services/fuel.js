import api from './api';

export const fuelService = {
  getAll: () => api.get('/abastecimentos'),
  getById: (id) => api.get(`/abastecimentos/${id}`),
  getByTruck: (truckId) => api.get(`/abastecimentos/truck/${truckId}`),
  getConsumption: (truckId) => api.get(`/abastecimentos/truck/${truckId}/consumption`),
  create: (data) => api.post('/abastecimentos', data)
};
