const express = require('express');
const driverController = require('../controllers/driver.controller');
const { checkPlanLimit } = require('../middlewares/planLimits.middleware');

const router = express.Router();

router.get('/', driverController.getAll);
router.get('/:id', driverController.getById);
router.post('/', checkPlanLimit('motoristas'), driverController.create);
router.put('/:id', driverController.update);
router.delete('/:id', driverController.delete);

module.exports = router;
