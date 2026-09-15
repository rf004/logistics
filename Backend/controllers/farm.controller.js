const farmService = require('../services/farm.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a new farm
// @route   POST /api/farms
const create = asyncHandler(async (req, res) => {
  const farm = await farmService.createFarm(req.body);
  res.status(201).json(new ApiResponse(201, farm, 'Farm created successfully'));
});

// @desc    Get all farms
// @route   GET /api/farms
const getAll = asyncHandler(async (req, res) => {
  const farms = await farmService.getAllFarms();
  res.status(200).json({
    success: true,
    count: farms.length,
    data: farms
  });
});

// @desc    Get single farm by ID
// @route   GET /api/farms/:id
const getById = asyncHandler(async (req, res) => {
  const farm = await farmService.getFarmById(req.params.id);
  res.status(200).json(new ApiResponse(200, farm, 'Farm retrieved successfully'));
});

// @desc    Update farm by ID
// @route   PUT /api/farms/:id
const update = asyncHandler(async (req, res) => {
  const farm = await farmService.updateFarm(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, farm, 'Farm updated successfully'));
});

// @desc    Delete farm by ID
// @route   DELETE /api/farms/:id
const deleteFarm = asyncHandler(async (req, res) => {
  await farmService.deleteFarm(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Farm deleted successfully'
  });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: deleteFarm
};
