const mongoose = require('mongoose');
const transportPlanRepository = require('../repositories/transportPlan.repository');
const truckRepository = require('../repositories/truck.repository');
const warehouseRepository = require('../repositories/warehouse.repository');
const farmRepository = require('../repositories/farm.repository');
const ApiError = require('../utils/ApiError');

const ALLOWED_STATUS_TRANSITIONS = {
  PLANNED: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: []
};

class TransportPlanService {
  /**
   * Validate and create a new TransportPlan document from optimization result
   * @param {Object} planData
   * @returns {Object} Created TransportPlan document
   */
  async createTransportPlan(planData) {
    if (!planData) {
      throw new ApiError(400, 'Transport plan data is required');
    }

    const { truckId, warehouseId, farms, route, totalLoad } = planData;

    if (!truckId || !mongoose.Types.ObjectId.isValid(truckId)) {
      throw new ApiError(400, 'Invalid or missing truck ID');
    }

    if (!warehouseId || !mongoose.Types.ObjectId.isValid(warehouseId)) {
      throw new ApiError(400, 'Invalid or missing warehouse ID');
    }

    const truck = await truckRepository.findById(truckId);
    if (!truck) {
      throw new ApiError(404, 'Truck not found');
    }

    const warehouse = await warehouseRepository.findById(warehouseId);
    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }

    if (!farms || !Array.isArray(farms) || farms.length === 0) {
      throw new ApiError(400, 'Farms list cannot be empty');
    }

    if (totalLoad === undefined || totalLoad === null || totalLoad <= 0) {
      throw new ApiError(400, 'Total load must be a positive number');
    }

    if (totalLoad > truck.capacity) {
      throw new ApiError(400, `Total load (${totalLoad}) exceeds truck capacity (${truck.capacity})`);
    }

    if (!route || !route.routeComplete) {
      throw new ApiError(400, 'Cannot create plan for an incomplete or unreachable route');
    }

    // Check duplicate farms
    const seenFarmIds = new Set();
    const seenOrders = new Set();

    for (const f of farms) {
      const fId = f.farmId ? f.farmId.toString() : null;
      if (!fId || !mongoose.Types.ObjectId.isValid(fId)) {
        throw new ApiError(400, `Invalid farm ID in plan: ${f.farmId}`);
      }

      if (seenFarmIds.has(fId)) {
        throw new ApiError(400, `Duplicate farm ID found in transport plan: ${fId}`);
      }
      seenFarmIds.add(fId);

      if (f.pickupOrder === undefined || typeof f.pickupOrder !== 'number' || f.pickupOrder < 1) {
        throw new ApiError(400, `Invalid pickupOrder for farm: ${fId}`);
      }

      if (seenOrders.has(f.pickupOrder)) {
        throw new ApiError(400, `Duplicate pickupOrder (${f.pickupOrder}) found in transport plan`);
      }
      seenOrders.add(f.pickupOrder);
    }

    // Verify all farms exist in DB
    for (const fId of seenFarmIds) {
      const farmDoc = await farmRepository.findById(fId);
      if (!farmDoc) {
        throw new ApiError(404, `Farm not found: ${fId}`);
      }
    }

    // Prepare plan payload
    const documentData = {
      truckId,
      warehouseId,
      farms: farms.map((f) => ({
        farmId: f.farmId,
        pickupOrder: f.pickupOrder,
        quantity: f.quantity,
        urgency: f.urgency
      })),
      route: {
        startNode: route.startNode || 'Depot',
        pickupSequence: route.pickupSequence || [],
        warehouseNode: route.warehouseNode || 'Warehouse',
        legs: route.legs || [],
        totalDistance: route.totalDistance
      },
      totalLoad,
      status: 'PLANNED'
    };

    return await transportPlanRepository.create(documentData);
  }

  async getAllTransportPlans(filter = {}) {
    return await transportPlanRepository.findAll(filter);
  }

  async getTransportPlanById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Transport Plan ID');
    }

    const plan = await transportPlanRepository.findById(id);
    if (!plan) {
      throw new ApiError(404, 'Transport plan not found');
    }

    return plan;
  }

  async updateTransportPlanStatus(id, newStatus) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Transport Plan ID');
    }

    if (!newStatus || typeof newStatus !== 'string') {
      throw new ApiError(400, 'Status string is required');
    }

    const uppercaseStatus = newStatus.toUpperCase();
    const allowedValues = ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

    if (!allowedValues.includes(uppercaseStatus)) {
      throw new ApiError(400, `Invalid status value. Allowed: ${allowedValues.join(', ')}`);
    }

    const plan = await transportPlanRepository.findById(id);
    if (!plan) {
      throw new ApiError(404, 'Transport plan not found');
    }

    const currentStatus = plan.status;
    const validNextStatuses = ALLOWED_STATUS_TRANSITIONS[currentStatus] || [];

    if (!validNextStatuses.includes(uppercaseStatus)) {
      throw new ApiError(
        400,
        `Cannot transition transport plan status from ${currentStatus} to ${uppercaseStatus}`
      );
    }

    return await transportPlanRepository.updateStatus(id, uppercaseStatus);
  }
}

module.exports = new TransportPlanService();
