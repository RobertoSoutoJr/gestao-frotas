const express = require('express');
const tripController = require('../controllers/trip.controller');
const { checkTripLimit } = require('../middlewares/planLimits.middleware');

const router = express.Router();

router.get('/', tripController.getAll);
router.get('/:id', tripController.getById);
router.post('/', checkTripLimit(), tripController.create);
router.put('/:id', tripController.update);
router.patch('/:id/finalizar', tripController.finalize);
router.patch('/:id/location', tripController.updateLocation);
router.post('/sync-locations', tripController.batchSyncLocations);
router.delete('/:id', tripController.delete);

module.exports = router;
