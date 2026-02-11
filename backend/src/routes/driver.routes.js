const express = require('express');
const driverController = require('../controllers/driver.controller');

const router = express.Router();

router.get('/', driverController.getAll);
router.get('/:id', driverController.getById);
router.post('/', driverController.create);
router.put('/:id', driverController.update);
router.delete('/:id', driverController.delete);

module.exports = router;
