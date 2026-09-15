const Graph = require('../utils/graph');

class RoadFeasibilityService {
  /**
   * Helper to format location object into node string identifier
   * E.g., "12.9716,77.5946" or uses explicit source/destination name/id if present
   */
  getNodeIdentifier(location, defaultName) {
    if (defaultName && typeof defaultName === 'string' && defaultName.trim()) {
      return defaultName.trim();
    }
    if (location && typeof location.latitude === 'number' && typeof location.longitude === 'number') {
      return `${location.latitude},${location.longitude}`;
    }
    return null;
  }

  /**
   * Check if a road is open and active
   * @param {Object} road
   * @returns {boolean}
   */
  isRoadOpen(road) {
    if (!road) return false;

    if (road.vehicleAllowed !== undefined && road.vehicleAllowed === false) {
      return false;
    }

    if (road.isActive !== undefined && road.isActive === false) {
      return false;
    }

    if (road.status) {
      const status = String(road.status).toUpperCase();
      if (status === 'CLOSED' || status === 'INACTIVE' || status === 'BLOCKED') {
        return false;
      }
    }

    return true;
  }

  /**
   * Check weight compatibility between truck and road
   * @param {Object} truck
   * @param {Object} road
   * @returns {boolean}
   */
  isWeightCompatible(truck, road) {
    if (!truck || !road) return true;

    const truckWeight = truck.maxWeight !== undefined ? Number(truck.maxWeight) : (truck.weight !== undefined ? Number(truck.weight) : null);
    const roadMaxWeight = road.maxWeight !== undefined ? Number(road.maxWeight) : null;

    if (truckWeight !== null && roadMaxWeight !== null && !isNaN(truckWeight) && !isNaN(roadMaxWeight)) {
      if (truckWeight > roadMaxWeight) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check width compatibility between truck and road
   * @param {Object} truck
   * @param {Object} road
   * @returns {boolean}
   */
  isWidthCompatible(truck, road) {
    if (!truck || !road) return true;

    const truckWidth = truck.width !== undefined ? Number(truck.width) : null;
    const roadMaxWidth = road.maxWidth !== undefined ? Number(road.maxWidth) : null;

    if (truckWidth !== null && roadMaxWidth !== null && !isNaN(truckWidth) && !isNaN(roadMaxWidth)) {
      if (truckWidth > roadMaxWidth) {
        return false;
      }
    }

    return true;
  }

  /**
   * Check height compatibility between truck and road
   * @param {Object} truck
   * @param {Object} road
   * @returns {boolean}
   */
  isHeightCompatible(truck, road) {
    if (!truck || !road) return true;

    const truckHeight = truck.height !== undefined ? Number(truck.height) : null;
    const roadMaxHeight = road.maxHeight !== undefined ? Number(road.maxHeight) : null;

    if (truckHeight !== null && roadMaxHeight !== null && !isNaN(truckHeight) && !isNaN(roadMaxHeight)) {
      if (truckHeight > roadMaxHeight) {
        return false;
      }
    }

    return true;
  }

  /**
   * Evaluate whether a truck can physically/legally use a road
   * @param {Object} truck
   * @param {Object} road
   * @returns {boolean}
   */
  canTruckUseRoad(truck, road) {
    if (!road) return false;
    if (!this.isRoadOpen(road)) return false;
    if (!this.isWeightCompatible(truck, road)) return false;
    if (!this.isWidthCompatible(truck, road)) return false;
    if (!this.isHeightCompatible(truck, road)) return false;

    return true;
  }

  /**
   * Filter all feasible roads for a specific truck
   * @param {Object} truck
   * @param {Array} roads
   * @returns {Array} List of feasible road objects
   */
  filterFeasibleRoads(truck, roads = []) {
    if (!roads || roads.length === 0) return [];
    return roads.filter((road) => this.canTruckUseRoad(truck, road));
  }

  /**
   * Build truck-specific directed graph from feasible roads
   * @param {Object} truck
   * @param {Array} roads
   * @returns {Object} { graph, feasibleRoads }
   */
  buildTruckGraph(truck, roads = []) {
    const feasibleRoads = this.filterFeasibleRoads(truck, roads);
    const graphInstance = new Graph();

    const feasibleRoadIds = [];

    for (const road of feasibleRoads) {
      const roadId = road._id ? road._id.toString() : road.roadId || road.id;
      feasibleRoadIds.push(roadId);

      const sourceNode = this.getNodeIdentifier(road.startLocation, road.source || road.sourceNode || road.name);
      const destNode = this.getNodeIdentifier(road.endLocation, road.destination || road.destinationNode);

      if (sourceNode && destNode) {
        // Forward edge: source -> dest
        graphInstance.addEdge(sourceNode, destNode, road.distance, roadId);

        // Check if road is bidirectional
        if (road.isBidirectional === true) {
          graphInstance.addEdge(destNode, sourceNode, road.distance, roadId);
        }
      }
    }

    const adjacencyList = graphInstance.getAdjacencyList();
    const hasEdges = Object.keys(adjacencyList).some((k) => adjacencyList[k].length > 0);

    return {
      feasibleRoads: feasibleRoadIds,
      graph: adjacencyList,
      routePossible: hasEdges
    };
  }
}

module.exports = new RoadFeasibilityService();
