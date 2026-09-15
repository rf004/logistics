const express = require('express');
const router = express.Router();

const truckController = require('../controllers/truck.controller');
const validate = require('../middlewares/validation.middleware');
const { validateCreateTruck, validateUpdateTruck } = require('../validators/truck.validator');

// Create a new truck
router.post('/', validate(validateCreateTruck), truckController.create);

// Get all trucks
router.get('/', truckController.getAll);

// Get single truck by ID
router.get('/:id', truckController.getById);

// Update truck by ID
router.put('/:id', validate(validateUpdateTruck), truckController.update);

// Delete truck by ID
router.delete('/:id', truckController.delete);

module.exports = router;
