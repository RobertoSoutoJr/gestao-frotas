const express = require('express');
const tripController = require('../controllers/trip.controller');
const { requireAdmin } = require('../middlewares/auth.middleware');
const { checkTripLimit } = require('../middlewares/planLimits.middleware');

const router = express.Router();

router.get('/', tripController.getAll);                        // motorista: filtered to their trips
router.get('/:id', tripController.getById);
router.post('/', requireAdmin, checkTripLimit(), tripController.create);
router.put('/:id', requireAdmin, tripController.update);
router.patch('/:id/finalizar', tripController.finalize);       // motorista: validated to their trip
router.patch('/:id/location', tripController.updateLocation);  // motorista: validated to their trip
router.post('/sync-locations', tripController.batchSyncLocations);
router.delete('/:id', requireAdmin, tripController.delete);

module.exports = router;
