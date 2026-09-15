const processEngineService = require('../services/processEngine.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Trigger farm logistics processing and prioritization
// @route   POST /api/process/process-farms
const processFarms = asyncHandler(async (req, res) => {
  const result = await processEngineService.processFarms();

  res.status(200).json(
    new ApiResponse(200, result, 'Farm processing completed successfully')
  );
});

module.exports = {
  processFarms
};
