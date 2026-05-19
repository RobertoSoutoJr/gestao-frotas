const documentService = require('../services/document.service');
const ocrService = require('../services/ocr.service');
const { asyncHandler } = require('../middlewares/errorHandler');

exports.getByEntity = asyncHandler(async (req, res) => {
  const { entidade_tipo, entidade_id } = req.params;
  const data = await documentService.getByEntity(entidade_tipo, Number(entidade_id), req.userId);
  res.json({ success: true, data });
});

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }

  const { entidade_tipo, entidade_id, tipo_documento, observacoes } = req.body;

  if (!entidade_tipo || !entidade_id || !tipo_documento) {
    return res.status(400).json({ success: false, message: 'entidade_tipo, entidade_id e tipo_documento são obrigatórios' });
  }

  const data = await documentService.upload(req.file, {
    entidade_tipo,
    entidade_id: Number(entidade_id),
    tipo_documento,
    observacoes,
  }, req.userId);

  res.status(201).json({ success: true, data });
});

exports.delete = asyncHandler(async (req, res) => {
  const result = await documentService.delete(Number(req.params.id), req.userId);
  res.json({ success: true, ...result });
});

/**
 * Upload a fuel receipt image, run QR + OCR extraction, return structured data.
 * The image is saved to Supabase Storage and a document record is created.
 */
exports.extractFuelReceipt = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Nenhum arquivo enviado' });
  }

  // 1. Upload to Supabase Storage as a temporary document (no entidade_id yet)
  const doc = await documentService.upload(req.file, {
    entidade_tipo: 'abastecimento',
    entidade_id: 0, // will be updated after fuel record is created
    tipo_documento: 'Nota Fiscal',
    observacoes: 'NFC-e extraída automaticamente',
  }, req.userId);

  // 2. Run QR + Claude Vision extraction
  const result = await ocrService.extractFuelReceipt(req.file.buffer, req.file.mimetype);

  res.json({
    success: true,
    documento_id: doc.id,
    documento_url: doc.arquivo_url,
    ...result,
  });
});
