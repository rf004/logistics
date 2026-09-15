const express = require('express');
const router = express.Router();
const processEngineController = require('../controllers/processEngine.controller');

router.post('/process-farms', processEngineController.processFarms);

module.exports = router;
