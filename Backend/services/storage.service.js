const { calculateHaversineDistance } = require('../utils/distance');

class StorageService {
  /**
   * Safely calculate available capacity for a warehouse
   * @param {Object} warehouse
   * @returns {number}
   */
  calculateAvailableCapacity(warehouse) {
    if (!warehouse) return 0;
    
    // In our Warehouse schema: availableStorage represents the current available capacity.
    // If availableStorage is defined, return Math.max(0, availableStorage)
    if (warehouse.availableStorage !== undefined && warehouse.availableStorage !== null) {
      return Math.max(0, Number(warehouse.availableStorage) || 0);
    }

    // Fallback if currentStorage and capacity exist
    if (warehouse.capacity !== undefined && warehouse.currentStorage !== undefined) {
      const available = Number(warehouse.capacity) - Number(warehouse.currentStorage);
      return Math.max(0, available);
    }

    return 0;
  }

  /**
   * Check if a warehouse is compatible with produce
   * @param {Object} farm
   * @param {Object} warehouse
   * @returns {boolean}
   */
  isWarehouseCompatible(farm, warehouse) {
    if (!farm || !warehouse) return false;
    
    // If warehouse has supportedProductTypes or similar, check against farm.productType or farm.productName
    const supportedTypes = warehouse.supportedProductTypes || warehouse.storageTypes || warehouse.acceptedProducts;
    if (Array.isArray(supportedTypes) && supportedTypes.length > 0) {
      const farmProductType = (farm.productType || '').toLowerCase();
      const farmProductName = (farm.productName || '').toLowerCase();
      return supportedTypes.some(type => {
        const t = (type || '').toLowerCase();
        return t === farmProductType || t === farmProductName;
      });
    }

    // If no compatibility restrictions defined in model, treat as compatible by default
    return true;
  }

  /**
   * Check if a warehouse can fully accommodate a farm's quantity
   * @param {Object} farm
   * @param {Object} warehouse
   * @returns {boolean}
   */
  canAccommodateFarm(farm, warehouse) {
    if (!farm || !warehouse) return false;
    const available = this.calculateAvailableCapacity(warehouse);
    return Boolean(farm.quantity && farm.quantity > 0 && farm.quantity <= available);
  }

  /**
   * Find suitable warehouses and select the optimal candidate for a farm
   * Ranking rules when multiple warehouses can fully accommodate:
   * 1. Smallest capacity surplus (capacity - quantity)
   * 2. Shortest Haversine distance
   *
   * @param {Object} farm
   * @param {Array} warehouses
   * @returns {Object} Storage feasibility result
   */
  findSuitableWarehouses(farm, warehouses = []) {
    if (!farm || !warehouses || warehouses.length === 0) {
      return {
        canFullyAccommodate: false,
        requiresMultipleWarehouses: true,
        selectedWarehouse: null,
        suitableWarehouses: []
      };
    }

    const farmQuantity = Number(farm.quantity) || 0;

    // Filter candidate warehouses that are compatible and can fully accommodate farm.quantity
    const candidates = [];
    let totalAvailableAcrossAll = 0;

    for (const warehouse of warehouses) {
      const availableCapacity = this.calculateAvailableCapacity(warehouse);
      totalAvailableAcrossAll += availableCapacity;

      const isCompatible = this.isWarehouseCompatible(farm, warehouse);
      if (isCompatible && availableCapacity >= farmQuantity && farmQuantity > 0) {
        const capacitySurplus = availableCapacity - farmQuantity;
        const distanceKm = calculateHaversineDistance(farm.location, warehouse.location);

        candidates.push({
          warehouse,
          warehouseId: warehouse._id ? warehouse._id.toString() : warehouse.id,
          name: warehouse.name,
          availableCapacity,
          capacitySurplus,
          remainingCapacityAfterAllocation: Math.round(capacitySurplus * 100) / 100,
          distanceKm
        });
      }
    }

    if (candidates.length === 0) {
      return {
        canFullyAccommodate: false,
        requiresMultipleWarehouses: true,
        selectedWarehouse: null,
        suitableWarehouses: []
      };
    }

    // Rank candidates:
    // 1. Smallest capacity surplus
    // 2. Shortest distanceKm (if both have distanceKm)
    candidates.sort((a, b) => {
      if (a.capacitySurplus !== b.capacitySurplus) {
        return a.capacitySurplus - b.capacitySurplus;
      }
      
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      
      return 0; // maintain relative order if distances cannot be compared
    });

    const bestCandidate = candidates[0];

    return {
      canFullyAccommodate: true,
      requiresMultipleWarehouses: false,
      selectedWarehouse: {
        warehouseId: bestCandidate.warehouseId,
        name: bestCandidate.name,
        availableCapacity: bestCandidate.availableCapacity,
        remainingCapacityAfterAllocation: bestCandidate.remainingCapacityAfterAllocation,
        distanceKm: bestCandidate.distanceKm
      },
      suitableWarehouses: candidates.map(c => ({
        warehouseId: c.warehouseId,
        name: c.name,
        availableCapacity: c.availableCapacity,
        remainingCapacityAfterAllocation: c.remainingCapacityAfterAllocation,
        distanceKm: c.distanceKm
      }))
    };
  }
}

module.exports = new StorageService();
