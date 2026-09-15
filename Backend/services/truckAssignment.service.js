class TruckAssignmentService {
  /**
   * Initialize in-memory temporary states for available trucks
   * @param {Array} trucks
   * @returns {Array} Array of temporary truckState objects
   */
  initTruckStates(trucks = []) {
    return trucks
      .filter((truck) => {
        // Status / Availability check
        if (truck.available !== undefined) {
          return truck.available === true;
        }
        if (truck.status) {
          return truck.status.toUpperCase() === 'AVAILABLE';
        }
        return true;
      })
      .map((truck) => {
        const capacity = Number(truck.capacity) || 0;
        const initialLoad = Number(truck.currentLoad) || 0;
        const availableCapacity = Math.max(0, capacity - initialLoad);

        return {
          truck,
          truckId: truck._id ? truck._id.toString() : truck.id,
          name: truck.name,
          capacity,
          initialLoad,
          assignedLoad: initialLoad,
          remainingCapacity: availableCapacity,
          assignedFarms: []
        };
      });
  }

  /**
   * Calculate current available capacity of a truckState
   * @param {Object} truckState
   * @returns {number}
   */
  calculateAvailableCapacity(truckState) {
    if (!truckState) return 0;
    return Math.max(0, truckState.remainingCapacity);
  }

  /**
   * Check if a truck can accommodate farm quantity
   * @param {Object} truckState
   * @param {Object} farm
   * @returns {boolean}
   */
  canAssignFarm(truckState, farm) {
    if (!truckState || !farm || !farm.quantity) return false;
    const available = this.calculateAvailableCapacity(truckState);
    return farm.quantity <= available;
  }

  /**
   * Check truck compatibility with farm/produce (refrigerated, temperatureControlled, etc.)
   * @param {Object} truckState
   * @param {Object} farm
   * @returns {boolean}
   */
  isTruckCompatible(truckState, farm) {
    if (!truckState || !farm) return false;
    // Check if truck schema specifies refrigerated or supported products in the future
    if (farm.requiresRefrigeration && truckState.truck.refrigerated !== undefined) {
      if (!truckState.truck.refrigerated) return false;
    }
    return true;
  }

  /**
   * Find feasible trucks for a farm
   * @param {Object} farm
   * @param {Array} truckStates
   * @returns {Array} List of feasible truckState candidates
   */
  getFeasibleTrucks(farm, truckStates = []) {
    if (!farm || !farm.quantity || farm.quantity <= 0) return [];
    return truckStates.filter(
      (ts) => this.isTruckCompatible(ts, farm) && this.canAssignFarm(ts, farm)
    );
  }

  /**
   * Select best truck among feasible candidates
   * Priority:
   * 1. Enough capacity (already filtered)
   * 2. Smallest remaining capacity after assignment (capacity surplus)
   * 3. Smallest current load / assigned load
   *
   * @param {Object} farm
   * @param {Array} truckStates
   * @returns {Object|null} Best truckState or null
   */
  selectBestTruck(farm, truckStates = []) {
    const feasible = this.getFeasibleTrucks(farm, truckStates);
    if (feasible.length === 0) return null;

    const farmQty = Number(farm.quantity);

    feasible.sort((a, b) => {
      const remainingA = a.remainingCapacity - farmQty;
      const remainingB = b.remainingCapacity - farmQty;

      if (remainingA !== remainingB) {
        return remainingA - remainingB; // Smallest remaining capacity after assignment
      }

      if (a.assignedLoad !== b.assignedLoad) {
        return a.assignedLoad - b.assignedLoad; // Tie-breaker: smallest current load
      }

      return 0;
    });

    return feasible[0];
  }

  /**
   * Assign farm to truck state in memory
   * @param {Object} farm
   * @param {Object} truckState
   * @returns {Object} Truck assignment details for farm
   */
  assignFarmToTruck(farm, truckState) {
    const farmQty = Number(farm.quantity);
    const loadBeforeAssignment = truckState.assignedLoad;

    truckState.assignedLoad += farmQty;
    truckState.remainingCapacity -= farmQty;
    const farmId = farm._id ? farm._id.toString() : farm.id;
    truckState.assignedFarms.push(farmId);

    return {
      assigned: true,
      truckId: truckState.truckId,
      truckName: truckState.name,
      loadBeforeAssignment,
      loadAfterAssignment: truckState.assignedLoad,
      remainingCapacity: truckState.remainingCapacity
    };
  }
}

module.exports = new TruckAssignmentService();
