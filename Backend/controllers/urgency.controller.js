const farmService = require('../services/farm.service');
const urgencyService = require('../services/urgency.service');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get urgency calculation for a single farm (Debug/Test Endpoint)
// @route   GET /api/urgency/farms/:id
const getFarmUrgency = asyncHandler(async (req, res) => {
  const farm = await farmService.getFarmById(req.params.id);
  const urgencyResult = urgencyService.calculateUrgency(farm);
  
  res.status(200).json({
    success: true,
    data: urgencyResult
  });
});

// @desc    Get urgency calculations for all farms sorted by priority (Debug/Test Endpoint)
// @route   GET /api/urgency/farms
const getAllFarmsUrgency = asyncHandler(async (req, res) => {
  const farms = await farmService.getAllFarms();
  
  const urgencyResults = farms.map((farm) => urgencyService.calculateUrgency(farm));

  // Sort by urgencyScore DESC, then quantity DESC
  urgencyResults.sort((a, b) => {
    if (b.urgencyScore !== a.urgencyScore) {
      return b.urgencyScore - a.urgencyScore;
    }
    return b.quantity - a.quantity;
  });

  res.status(200).json({
    success: true,
    count: urgencyResults.length,
    data: urgencyResults
  });
});

module.exports = {
  getFarmUrgency,
  getAllFarmsUrgency
};
