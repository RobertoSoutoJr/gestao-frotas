import api from './api';

export const documentsService = {
  getByEntity: (entidadeTipo, entidadeId) =>
    api.get(`/documentos/${entidadeTipo}/${entidadeId}`),

  upload: (file, metadata) => {
    const formData = new FormData();
    formData.append('arquivo', file);
    formData.append('entidade_tipo', metadata.entidade_tipo);
    formData.append('entidade_id', String(metadata.entidade_id));
    formData.append('tipo_documento', metadata.tipo_documento);
    if (metadata.observacoes) formData.append('observacoes', metadata.observacoes);

    return api.post('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  delete: (id) => api.delete(`/documentos/${id}`),
};
