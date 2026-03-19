import api from './api';

export const stockService = {
  getAll: () => api.get('/estoque'),
  getById: (id) => api.get(`/estoque/${id}`),
  create: (data) => api.post('/estoque', data),
  update: (id, data) => api.put(`/estoque/${id}`, data),
  markAsPaid: (id) => api.patch(`/estoque/${id}/pagar`),
  togglePaid: (id, pago) => api.patch(`/estoque/${id}/toggle-pago`, { pago }),
  makePartialPayment: (id, data) => api.post(`/estoque/${id}/pagamento`, data),
  getPaymentHistory: (id) => api.get(`/estoque/${id}/pagamentos`),
  getCheques: (id) => api.get(`/estoque/${id}/cheques`),
  delete: (id) => api.delete(`/estoque/${id}`)
};
