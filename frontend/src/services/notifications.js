import api from './api';

export const notificationsService = {
  list: (params = {}) => api.get('/notifications', { params }),
  countUnread: () => api.get('/notifications/unread-count'),
  markRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllRead: () => api.patch('/notifications/read-all'),
  checkAndGenerate: () => api.post('/notifications/check'),
};
