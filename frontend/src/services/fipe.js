import api from './api';

export const fipeService = {
  getMarcas: () => api.get('/fipe/marcas'),
  getModelos: (marcaCodigo) => api.get(`/fipe/marcas/${marcaCodigo}/modelos`),
  getAnos: (marcaCodigo, modeloCodigo) => api.get(`/fipe/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos`),
  getPreco: (marcaCodigo, modeloCodigo, anoCodigo) =>
    api.get(`/fipe/marcas/${marcaCodigo}/modelos/${modeloCodigo}/anos/${anoCodigo}`),
};

export const anpService = {
  getPrecos: (params = {}) => api.get('/anp/precos', { params }),
};
