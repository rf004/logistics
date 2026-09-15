const truckService = require('../services/truck.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a new truck
// @route   POST /api/trucks
const create = asyncHandler(async (req, res) => {
  const truck = await truckService.createTruck(req.body);
  res.status(201).json(new ApiResponse(201, truck, 'Truck created successfully'));
});

// @desc    Get all trucks
// @route   GET /api/trucks
const getAll = asyncHandler(async (req, res) => {
  const trucks = await truckService.getAllTrucks();
  res.status(200).json({
    success: true,
    count: trucks.length,
    data: trucks
  });
});

// @desc    Get single truck by ID
// @route   GET /api/trucks/:id
const getById = asyncHandler(async (req, res) => {
  const truck = await truckService.getTruckById(req.params.id);
  res.status(200).json(new ApiResponse(200, truck, 'Truck retrieved successfully'));
});

// @desc    Update truck by ID
// @route   PUT /api/trucks/:id
const update = asyncHandler(async (req, res) => {
  const truck = await truckService.updateTruck(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, truck, 'Truck updated successfully'));
});

// @desc    Delete truck by ID
// @route   DELETE /api/trucks/:id
const deleteTruck = asyncHandler(async (req, res) => {
  await truckService.deleteTruck(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Truck deleted successfully'
  });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: deleteTruck
};
