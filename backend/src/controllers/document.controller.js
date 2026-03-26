const documentService = require('../services/document.service');
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
