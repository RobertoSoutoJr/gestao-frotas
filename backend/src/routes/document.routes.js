const express = require('express');
const multer = require('multer');
const documentController = require('../controllers/document.controller');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = [
      'image/jpeg', 'image/png', 'image/webp',
      'application/pdf',
    ];
    if (allowed.includes(file.mimetype)) cb(null, true);
    else cb(new Error('Tipo de arquivo não permitido. Use JPG, PNG, WebP ou PDF.'), false);
  }
});

const router = express.Router();

router.get('/:entidade_tipo/:entidade_id', documentController.getByEntity);
router.post('/', upload.single('arquivo'), documentController.upload);
router.delete('/:id', documentController.delete);

module.exports = router;
