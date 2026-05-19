import { api } from './client';

export interface FuelReceiptExtraction {
  litros: number | null;
  valor_litro: number | null;
  valor_total: number | null;
  tipo_combustivel: string | null;
  posto_nome: string | null;
  posto_cnpj: string | null;
  data_abastecimento: string | null;
  placa_veiculo: string | null;
  numero_nfce: string | null;
  chave_acesso: string | null;
}

export interface ExtractFuelReceiptResponse {
  success: boolean;
  documento_id: number;
  documento_url: string;
  extracted: FuelReceiptExtraction | null;
  confidence: number;
  method: 'qr+vision' | 'qr' | 'vision' | 'none';
  error?: string;
}

export const ocrApi = {
  /**
   * Upload a fuel receipt photo and extract data via QR + Claude Vision.
   * @param imageUri - Local file URI from image picker / camera
   */
  extractFuelReceipt: async (imageUri: string): Promise<ExtractFuelReceiptResponse> => {
    const formData = new FormData();
    formData.append('arquivo', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'nfce.jpg',
    } as any);

    const { data } = await api.post<ExtractFuelReceiptResponse>(
      '/documentos/extract-fuel-receipt',
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000, // OCR can take a few seconds
      },
    );
    return data;
  },
};
