const farmService = require('./farm.service');
const warehouseService = require('./warehouse.service');
const truckService = require('./truck.service');
const roadService = require('./road.service');
const urgencyService = require('./urgency.service');
const storageService = require('./storage.service');
const truckAssignmentService = require('./truckAssignment.service');
const roadFeasibilityService = require('./roadFeasibility.service');
const routeOptimizationService = require('./routeOptimization.service');
const transportPlanService = require('./transportPlan.service');
const PriorityQueue = require('../utils/priorityQueue');

class ProcessEngineService {
  /**
   * Compare priority of two items: { farm, urgency }
   * Returns true if 'a' has higher priority than 'b'.
   * 
   * Priority Rules:
   * 1. urgencyScore DESC
   * 2. quantity DESC
   * 3. harvestTime ASC (earlier harvest time gets higher priority)
   */
  comparePriority(a, b) {
    if (a.urgency.urgencyScore !== b.urgency.urgencyScore) {
      return a.urgency.urgencyScore > b.urgency.urgencyScore;
    }

    if (a.farm.quantity !== b.farm.quantity) {
      return a.farm.quantity > b.farm.quantity;
    }

    const timeA = new Date(a.farm.harvestTime).getTime();
    const timeB = new Date(b.farm.harvestTime).getTime();
    return timeA < timeB;
  }

  /**
   * Helper to format node identifier for a farm or warehouse
   */
  getNodeIdentifier(entity) {
    if (!entity) return null;
    if (entity.name && typeof entity.name === 'string') return entity.name.trim();
    if (entity.location && typeof entity.location.latitude === 'number' && typeof entity.location.longitude === 'number') {
      return `${entity.location.latitude},${entity.location.longitude}`;
    }
    return null;
  }

  /**
   * Process all active farms: Urgency -> Storage -> Truck -> Road Graph -> Route Optimization -> Persist Transport Plans
   */
  async processFarms() {
    const [farms, warehouses, trucks, roads] = await Promise.all([
      farmService.getAllFarms(),
      warehouseService.getAllWarehouses(),
      truckService.getAllTrucks(),
      roadService.getAllRoads()
    ]);

    if (!farms || farms.length === 0) {
      return {
        totalFarms: 0,
        processedFarms: 0,
        prioritizedFarms: [],
        truckAssignments: [],
        createdTransportPlans: []
      };
    }

    // Map warehouses by ID for quick lookup
    const warehouseMap = new Map();
    warehouses.forEach(w => {
      const id = w._id ? w._id.toString() : w.id;
      warehouseMap.set(id, w);
    });

    // Map farm objects by ID
    const farmMap = new Map();

    // Initialize temporary truck states in memory
    const truckStates = truckAssignmentService.initTruckStates(trucks);

    const pq = new PriorityQueue((a, b) => this.comparePriority(a, b));

    for (const farm of farms) {
      const farmId = farm._id ? farm._id.toString() : farm.id;
      farmMap.set(farmId, farm);
      const urgency = urgencyService.calculateUrgency(farm);
      pq.enqueue({ farm, urgency });
    }

    const prioritizedFarms = [];
    const farmUrgencyMap = new Map();
    const farmWarehouseMap = new Map();

    while (!pq.isEmpty()) {
      const item = pq.dequeue();
      const farmId = item.farm._id ? item.farm._id.toString() : item.farm.id;
      farmUrgencyMap.set(farmId, item.urgency);

      const storageFeasibility = storageService.findSuitableWarehouses(item.farm, warehouses);
      if (storageFeasibility.canFullyAccommodate && storageFeasibility.selectedWarehouse) {
        farmWarehouseMap.set(farmId, storageFeasibility.selectedWarehouse);
      }

      let truckAssignmentResult;

      if (!storageFeasibility.canFullyAccommodate) {
        truckAssignmentResult = {
          assigned: false,
          reason: 'STORAGE_NOT_AVAILABLE'
        };
      } else {
        const bestTruckState = truckAssignmentService.selectBestTruck(item.farm, truckStates);
        if (bestTruckState) {
          truckAssignmentResult = truckAssignmentService.assignFarmToTruck(item.farm, bestTruckState);
        } else {
          truckAssignmentResult = {
            assigned: false,
            reason: 'NO_FEASIBLE_TRUCK'
          };
        }
      }

      prioritizedFarms.push({
        farmId,
        productName: item.farm.productName,
        productType: item.farm.productType,
        quantity: item.farm.quantity,
        harvestTime: item.farm.harvestTime,
        shelfLife: item.farm.shelfLife,
        remainingShelfLife: item.urgency.remainingShelfLife,
        remainingPercentage: item.urgency.remainingPercentage,
        urgencyScore: item.urgency.urgencyScore,
        urgencyLevel: item.urgency.urgencyLevel,
        isExpired: item.urgency.isExpired,
        storage: storageFeasibility,
        truckAssignment: truckAssignmentResult
      });
    }

    const createdTransportPlans = [];

    // Run Route Optimization & Create Transport Plans per assigned truck
    const truckSummary = await Promise.all(
      truckStates.map(async (ts) => {
        let graphResult = {
          feasibleRoads: [],
          graph: {},
          routePossible: false
        };
        let optimizedRoute = null;

        if (ts.assignedFarms.length > 0) {
          graphResult = roadFeasibilityService.buildTruckGraph(ts.truck, roads);

          const assignedFarmObjs = ts.assignedFarms.map((fId) => {
            const farmDoc = farmMap.get(fId);
            const urgencyObj = farmUrgencyMap.get(fId);
            return {
              farm: farmDoc,
              urgency: urgencyObj
            };
          });

          const firstFarmId = ts.assignedFarms[0];
          const selectedWhMeta = farmWarehouseMap.get(firstFarmId);
          const warehouseDoc = selectedWhMeta ? warehouseMap.get(selectedWhMeta.warehouseId) : null;

          if (warehouseDoc && graphResult.routePossible) {
            optimizedRoute = routeOptimizationService.optimizePickupSequence({
              truckState: ts,
              assignedFarms: assignedFarmObjs,
              warehouse: warehouseDoc,
              graph: graphResult.graph
            });

            // Convert completed valid route into persistent Transport Plan document
            if (optimizedRoute && optimizedRoute.routeComplete && (!optimizedRoute.unservedFarms || optimizedRoute.unservedFarms.length === 0)) {
              const planPayload = {
                truckId: ts.truckId,
                warehouseId: warehouseDoc._id ? warehouseDoc._id.toString() : warehouseDoc.id,
                farms: ts.assignedFarms.map((fId, index) => {
                  const farmDoc = farmMap.get(fId);
                  const urgencyObj = farmUrgencyMap.get(fId);
                  // Find order in pickupSequence if present
                  const seqIndex = optimizedRoute.pickupSequence.indexOf(fId);
                  const order = seqIndex !== -1 ? seqIndex + 1 : index + 1;

                  return {
                    farmId: fId,
                    pickupOrder: order,
                    quantity: farmDoc.quantity,
                    urgency: urgencyObj ? urgencyObj.urgencyScore : 0
                  };
                }),
                route: {
                  startNode: ts.truck.name || 'Depot',
                  pickupSequence: optimizedRoute.pickupSequence,
                  warehouseNode: warehouseDoc.name || 'Warehouse',
                  legs: optimizedRoute.legs,
                  totalDistance: optimizedRoute.totalDistance
                },
                totalLoad: optimizedRoute.totalLoad
              };

              // Sort farms array by pickupOrder ascending
              planPayload.farms.sort((a, b) => a.pickupOrder - b.pickupOrder);

              const createdPlan = await transportPlanService.createTransportPlan(planPayload);
              createdTransportPlans.push(createdPlan);
            }
          }
        }

        return {
          truckId: ts.truckId,
          name: ts.name,
          capacity: ts.capacity,
          initialLoad: ts.initialLoad,
          assignedLoad: ts.assignedLoad,
          remainingCapacity: ts.remainingCapacity,
          assignedFarms: ts.assignedFarms,
          roadFeasibility: graphResult,
          optimizedRoute
        };
      })
    );

    return {
      totalFarms: farms.length,
      processedFarms: prioritizedFarms.length,
      prioritizedFarms,
      truckAssignments: truckSummary,
      createdTransportPlans
    };
  }
}

module.exports = new ProcessEngineService();
