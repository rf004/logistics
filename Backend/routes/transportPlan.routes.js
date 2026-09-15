const express = require('express');
const router = express.Router();
const transportPlanController = require('../controllers/transportPlan.controller');

router.post('/', transportPlanController.createPlan);
router.get('/', transportPlanController.getAllPlans);
router.get('/:id', transportPlanController.getPlanById);
router.patch('/:id/status', transportPlanController.updatePlanStatus);

module.exports = router;
