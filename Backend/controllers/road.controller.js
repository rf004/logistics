const roadService = require('../services/road.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a new road
// @route   POST /api/roads
const create = asyncHandler(async (req, res) => {
  const road = await roadService.createRoad(req.body);
  res.status(201).json(new ApiResponse(201, road, 'Road created successfully'));
});

// @desc    Get all roads
// @route   GET /api/roads
const getAll = asyncHandler(async (req, res) => {
  const roads = await roadService.getAllRoads();
  res.status(200).json({
    success: true,
    count: roads.length,
    data: roads
  });
});

// @desc    Get single road by ID
// @route   GET /api/roads/:id
const getById = asyncHandler(async (req, res) => {
  const road = await roadService.getRoadById(req.params.id);
  res.status(200).json(new ApiResponse(200, road, 'Road retrieved successfully'));
});

// @desc    Update road by ID
// @route   PUT /api/roads/:id
const update = asyncHandler(async (req, res) => {
  const road = await roadService.updateRoad(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, road, 'Road updated successfully'));
});

// @desc    Delete road by ID
// @route   DELETE /api/roads/:id
const deleteRoad = asyncHandler(async (req, res) => {
  await roadService.deleteRoad(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Road deleted successfully'
  });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: deleteRoad
};
