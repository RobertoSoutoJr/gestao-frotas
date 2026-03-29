const express = require('express');
const tripCostController = require('../controllers/tripCost.controller');

const router = express.Router();

// /api/viagens/:tripId/custos
router.get('/:tripId/custos', tripCostController.getByTrip);
router.get('/:tripId/custos/resumo', tripCostController.getSummary);
router.post('/:tripId/custos', tripCostController.create);

// /api/viagem-custos/:id
router.put('/custo/:id', tripCostController.update);
router.delete('/custo/:id', tripCostController.delete);

module.exports = router;
