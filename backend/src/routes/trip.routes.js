const express = require('express');
const tripController = require('../controllers/trip.controller');

const router = express.Router();

router.get('/', tripController.getAll);
router.get('/:id', tripController.getById);
router.post('/', tripController.create);
router.put('/:id', tripController.update);
router.patch('/:id/finalizar', tripController.finalize);
router.delete('/:id', tripController.delete);

module.exports = router;
