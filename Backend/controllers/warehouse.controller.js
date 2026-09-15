const warehouseService = require('../services/warehouse.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create a new warehouse
// @route   POST /api/warehouses
const create = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.createWarehouse(req.body);
  res.status(201).json(new ApiResponse(201, warehouse, 'Warehouse created successfully'));
});

// @desc    Get all warehouses
// @route   GET /api/warehouses
const getAll = asyncHandler(async (req, res) => {
  const warehouses = await warehouseService.getAllWarehouses();
  res.status(200).json({
    success: true,
    count: warehouses.length,
    data: warehouses
  });
});

// @desc    Get single warehouse by ID
// @route   GET /api/warehouses/:id
const getById = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.getWarehouseById(req.params.id);
  res.status(200).json(new ApiResponse(200, warehouse, 'Warehouse retrieved successfully'));
});

// @desc    Update warehouse by ID
// @route   PUT /api/warehouses/:id
const update = asyncHandler(async (req, res) => {
  const warehouse = await warehouseService.updateWarehouse(req.params.id, req.body);
  res.status(200).json(new ApiResponse(200, warehouse, 'Warehouse updated successfully'));
});

// @desc    Delete warehouse by ID
// @route   DELETE /api/warehouses/:id
const deleteWarehouse = asyncHandler(async (req, res) => {
  await warehouseService.deleteWarehouse(req.params.id);
  res.status(200).json({
    success: true,
    message: 'Warehouse deleted successfully'
  });
});

module.exports = {
  create,
  getAll,
  getById,
  update,
  delete: deleteWarehouse
};
