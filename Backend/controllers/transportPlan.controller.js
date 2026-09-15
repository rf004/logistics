const transportPlanService = require('../services/transportPlan.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiResponse = require('../utils/ApiResponse');

// @desc    Create transport plan manually
// @route   POST /api/transport-plans
const createPlan = asyncHandler(async (req, res) => {
  const plan = await transportPlanService.createTransportPlan(req.body);
  res.status(201).json(new ApiResponse(201, plan, 'Transport plan created successfully'));
});

// @desc    Get all transport plans
// @route   GET /api/transport-plans
const getAllPlans = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status.toUpperCase();
  if (req.query.truckId) filter.truckId = req.query.truckId;
  if (req.query.warehouseId) filter.warehouseId = req.query.warehouseId;

  const plans = await transportPlanService.getAllTransportPlans(filter);
  res.status(200).json({
    success: true,
    count: plans.length,
    data: plans
  });
});

// @desc    Get transport plan by ID
// @route   GET /api/transport-plans/:id
const getPlanById = asyncHandler(async (req, res) => {
  const plan = await transportPlanService.getTransportPlanById(req.params.id);
  res.status(200).json(new ApiResponse(200, plan, 'Transport plan retrieved successfully'));
});

// @desc    Update transport plan status
// @route   PATCH /api/transport-plans/:id/status
const updatePlanStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const updatedPlan = await transportPlanService.updateTransportPlanStatus(req.params.id, status);
  res.status(200).json(new ApiResponse(200, updatedPlan, 'Transport plan status updated successfully'));
});

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlanStatus
};
