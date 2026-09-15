const express = require('express');
const router = express.Router();

const farmController = require('../controllers/farm.controller');
const validate = require('../middlewares/validation.middleware');
const { validateCreateFarm, validateUpdateFarm } = require('../validators/farm.validator');

// Create a new farm
router.post('/',validate(validateCreateFarm),farmController.create);

// Get all farms
router.get('/',farmController.getAll);

// Get single farm by ID
router.get('/:id',farmController.getById);

// Update farm by ID
router.put('/:id',validate(validateUpdateFarm),farmController.update);

// Delete farm by ID
router.delete('/:id',farmController.delete);

module.exports = router;
