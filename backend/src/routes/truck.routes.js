const express = require('express');
const multer = require('multer');
const truckController = require('../controllers/truck.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');
const { checkPlanLimit } = require('../middlewares/planLimits.middleware');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Apenas imagens são permitidas'), false);
  }
});

const router = express.Router();

router.get('/', truckController.getAll);             // motorista: filtered to their truck
router.get('/:id', truckController.getById);
router.post('/', requireAdmin, checkPlanLimit('caminhoes'), truckController.create);
router.put('/:id', requireAdmin, truckController.update);
router.delete('/:id', requireAdmin, truckController.delete);
router.post('/:id/foto', requireAdmin, upload.single('foto'), truckController.uploadFoto);

module.exports = router;
