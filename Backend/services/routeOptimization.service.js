const pathfindingService = require('./pathfinding.service');
const { URGENCY_TIE_THRESHOLD } = require('../config/constants');

class RouteOptimizationService {
  /**
   * Helper to format location object into node string identifier
   */
  getNodeIdentifier(entity, defaultName) {
    if (entity) {
      if (entity.name && typeof entity.name === 'string' && entity.name.trim()) {
        return entity.name.trim();
      }
      const loc = entity.location || entity.currentLocation;
      if (loc && typeof loc.latitude === 'number' && typeof loc.longitude === 'number') {
        return `${loc.latitude},${loc.longitude}`;
      }
    }
    if (defaultName && typeof defaultName === 'string' && defaultName.trim()) {
      return defaultName.trim();
    }
    return null;
  }

  /**
   * Optimize multi-farm pickup sequence for a single assigned truck using greedy urgency + Dijkstra tie-breaking
   *
   * @param {Object} params
   * @param {Object} params.truckState - Temporary truckState object
   * @param {Array} params.assignedFarms - Array of farm objects assigned to this truck (with urgency score)
   * @param {Object} params.warehouse - Selected warehouse document
   * @param {Object} params.graph - Truck-specific road graph
   * @returns {Object} Route optimization result
   */
  optimizePickupSequence({ truckState, assignedFarms = [], warehouse, graph }) {
    const truck = truckState ? truckState.truck : null;
    const truckId = truckState ? truckState.truckId : (truck ? (truck._id ? truck._id.toString() : truck.id) : null);
    const truckCapacity = truckState ? truckState.capacity : (truck ? Number(truck.capacity) || 0 : 0);

    const warehouseId = warehouse ? (warehouse._id ? warehouse._id.toString() : warehouse.id) : null;
    const warehouseNode = this.getNodeIdentifier(warehouse, 'Warehouse');

    // Determine start node from truck currentLocation or name
    let currentNode = this.getNodeIdentifier(truck, 'Depot');

    let currentLoad = truckState ? truckState.initialLoad || 0 : 0;

    let unvisitedFarms = assignedFarms.map((f) => {
      const farmObj = f.farm || f;
      const urgencyObj = f.urgency || {};
      const farmId = farmObj._id ? farmObj._id.toString() : farmObj.farmId || farmObj.id;
      const nodeId = this.getNodeIdentifier(farmObj, farmObj.name);

      return {
        farm: farmObj,
        farmId,
        nodeId,
        quantity: Number(farmObj.quantity) || 0,
        urgencyScore: urgencyObj.urgencyScore !== undefined ? Number(urgencyObj.urgencyScore) : 0,
        urgencyLevel: urgencyObj.urgencyLevel || 'LOW'
      };
    });

    const pickupSequence = [];
    const legs = [];
    const unservedFarms = [];
    let totalDistance = 0;

    while (unvisitedFarms.length > 0) {
      // Filter feasible candidate farms (that fit remaining truck capacity and are reachable)
      const candidateEvaluations = [];

      for (const item of unvisitedFarms) {
        // Capacity check
        if (currentLoad + item.quantity > truckCapacity) {
          // Cannot fit this farm right now
          continue;
        }

        // Dijkstra distance check from currentNode to item.nodeId
        const pathRes = pathfindingService.findShortestPath(graph, currentNode, item.nodeId);

        if (!pathRes.reachable) {
          // Cannot reach this farm
          continue;
        }

        candidateEvaluations.push({
          item,
          pathRes
        });
      }

      if (candidateEvaluations.length === 0) {
        // No remaining unvisited farm can be picked up right now
        break;
      }

      // Determine highest urgency score among reachable & capacity-feasible candidate farms
      let highestUrgency = -Infinity;
      for (const cand of candidateEvaluations) {
        if (cand.item.urgencyScore > highestUrgency) {
          highestUrgency = cand.item.urgencyScore;
        }
      }

      // Filter priorityGroup whose urgencyScore is within URGENCY_TIE_THRESHOLD of highestUrgency
      const priorityGroup = candidateEvaluations.filter(
        (cand) => highestUrgency - cand.item.urgencyScore <= URGENCY_TIE_THRESHOLD
      );

      // Select candidate in priorityGroup with shortest Dijkstra distance
      priorityGroup.sort((a, b) => a.pathRes.distance - b.pathRes.distance);
      const selected = priorityGroup[0];

      // Execute pickup for selected farm
      const chosenFarm = selected.item;
      const legPath = selected.pathRes;

      pickupSequence.push(chosenFarm.farmId);
      currentLoad += chosenFarm.quantity;
      totalDistance += legPath.distance;

      legs.push({
        from: currentNode,
        to: chosenFarm.nodeId,
        distance: legPath.distance,
        roads: legPath.roads,
        nodes: legPath.nodes
      });

      currentNode = chosenFarm.nodeId;

      // Remove chosen farm from unvisited list
      unvisitedFarms = unvisitedFarms.filter((f) => f.farmId !== chosenFarm.farmId);
    }

    // Mark remaining unvisited farms as unserved with specific reason
    for (const remainingItem of unvisitedFarms) {
      let reason = 'CAPACITY_EXCEEDED';
      if (currentLoad + remainingItem.quantity <= truckCapacity) {
        const pathRes = pathfindingService.findShortestPath(graph, currentNode, remainingItem.nodeId);
        if (!pathRes.reachable) {
          reason = 'UNREACHABLE';
        }
      }

      unservedFarms.push({
        farmId: remainingItem.farmId,
        name: remainingItem.farm.name,
        reason
      });
    }

    // Mandatory final leg: currentNode -> warehouse
    let warehouseReachable = false;
    let finalLeg = null;

    if (warehouseNode && currentNode) {
      const whPathRes = pathfindingService.findShortestPath(graph, currentNode, warehouseNode);
      if (whPathRes.reachable) {
        warehouseReachable = true;
        totalDistance += whPathRes.distance;

        finalLeg = {
          from: currentNode,
          to: warehouseNode,
          distance: whPathRes.distance,
          roads: whPathRes.roads,
          nodes: whPathRes.nodes
        };

        legs.push(finalLeg);
      }
    }

    const routeComplete = warehouseReachable && unservedFarms.length === 0;

    return {
      truckId,
      warehouseId,
      routeComplete,
      warehouseReachable,
      pickupSequence,
      totalLoad: Math.round(currentLoad * 100) / 100,
      totalDistance: Math.round(totalDistance * 100) / 100,
      legs,
      unservedFarms
    };
  }
}

module.exports = new RouteOptimizationService();
