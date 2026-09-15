const express = require('express');
const router = express.Router();
const urgencyController = require('../controllers/urgency.controller');
const { validateFarmId } = require('../validators/urgency.validator');

// Debug / Testing endpoints
router.get('/farms', urgencyController.getAllFarmsUrgency);
router.get('/farms/:id', validateFarmId, urgencyController.getFarmUrgency);

module.exports = router;
