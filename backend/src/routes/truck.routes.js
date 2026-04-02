const express = require('express');
const multer = require('multer');
const truckController = require('../controllers/truck.controller');
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

router.get('/', truckController.getAll);
router.get('/:id', truckController.getById);
router.post('/', checkPlanLimit('caminhoes'), truckController.create);
router.put('/:id', truckController.update);
router.delete('/:id', truckController.delete);
router.post('/:id/foto', upload.single('foto'), truckController.uploadFoto);

module.exports = router;
