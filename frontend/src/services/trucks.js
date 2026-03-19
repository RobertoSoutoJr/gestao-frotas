import api from './api';

export const trucksService = {
  getAll: () => api.get('/caminhoes'),
  getById: (id) => api.get(`/caminhoes/${id}`),
  create: (data) => api.post('/caminhoes', data),
  update: (id, data) => api.put(`/caminhoes/${id}`, data),
  delete: (id) => api.delete(`/caminhoes/${id}`),
  uploadFoto: (id, file) => {
    const formData = new FormData();
    formData.append('foto', file);
    return api.post(`/caminhoes/${id}/foto`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  }
};
