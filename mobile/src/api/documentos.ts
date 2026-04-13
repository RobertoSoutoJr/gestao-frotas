import { api } from './client';

export interface UploadDocumentoPayload {
  entidade_tipo: 'manutencao' | 'viagem' | 'abastecimento';
  entidade_id: number;
  tipo_documento: string;
  observacoes?: string;
}

export interface Documento {
  id: number;
  user_id: number;
  entidade_tipo: string;
  entidade_id: number;
  tipo_documento: string;
  arquivo_url: string;
  observacoes?: string;
  created_at: string;
}

/**
 * Upload a photo/document via multipart/form-data.
 * Uses the raw axios instance (not apiPost) because we need FormData headers.
 */
export const documentosApi = {
  upload: async (
    fileUri: string,
    fileName: string,
    mimeType: string,
    meta: UploadDocumentoPayload,
  ): Promise<Documento> => {
    const formData = new FormData();
    formData.append('arquivo', {
      uri: fileUri,
      name: fileName,
      type: mimeType,
    } as any);
    formData.append('entidade_tipo', meta.entidade_tipo);
    formData.append('entidade_id', String(meta.entidade_id));
    formData.append('tipo_documento', meta.tipo_documento);
    if (meta.observacoes) {
      formData.append('observacoes', meta.observacoes);
    }

    const response = await api.post('/documentos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    // api interceptor unwraps to response.data (the envelope),
    // then we need .data from the envelope
    const envelope = response as any;
    return envelope.data ?? envelope;
  },
};
