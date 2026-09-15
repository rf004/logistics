const storageService = require('../services/storage.service');
const { calculateHaversineDistance } = require('../utils/distance');
const assert = require('assert');

function runTests() {
  console.log('--- Running Storage Feasibility Tests ---');

  // Test 1: Haversine distance
  {
    const farmLoc = { latitude: 12.9716, longitude: 77.5946 }; // Bengaluru
    const whLoc = { latitude: 13.0827, longitude: 80.2707 };   // Chennai
    const dist = calculateHaversineDistance(farmLoc, whLoc);
    console.log('Test 1 Haversine Distance (Bengaluru -> Chennai):', dist, 'km');
    assert(dist > 280 && dist < 350, 'Distance should be roughly 290-340 km');
  }

  // Test 2: Case 1 - One suitable warehouse
  {
    const farm = { quantity: 200, location: { latitude: 12.0, longitude: 77.0 } };
    const warehouses = [
      { _id: 'W1', name: 'Warehouse 1', availableStorage: 500, location: { latitude: 12.1, longitude: 77.1 } }
    ];
    const res = storageService.findSuitableWarehouses(farm, warehouses);
    console.log('Test 2 Case 1 (One suitable):', res.selectedWarehouse);
    assert.strictEqual(res.canFullyAccommodate, true);
    assert.strictEqual(res.requiresMultipleWarehouses, false);
    assert.strictEqual(res.selectedWarehouse.warehouseId, 'W1');
  }

  // Test 3: Case 2 - Insufficient warehouse
  {
    const farm = { quantity: 600, location: { latitude: 12.0, longitude: 77.0 } };
    const warehouses = [
      { _id: 'W1', name: 'Warehouse 1', availableStorage: 500, location: { latitude: 12.1, longitude: 77.1 } }
    ];
    const res = storageService.findSuitableWarehouses(farm, warehouses);
    console.log('Test 3 Case 2 (Insufficient):', res);
    assert.strictEqual(res.canFullyAccommodate, false);
    assert.strictEqual(res.requiresMultipleWarehouses, true);
    assert.strictEqual(res.selectedWarehouse, null);
  }

  // Test 4: Case 3 - Multiple suitable warehouses (Select minimum surplus)
  {
    const farm = { quantity: 400, location: { latitude: 12.0, longitude: 77.0 } };
    const warehouses = [
      { _id: 'WA', name: 'Warehouse A', availableStorage: 500, location: { latitude: 12.5, longitude: 77.5 } }, // surplus = 100
      { _id: 'WB', name: 'Warehouse B', availableStorage: 800, location: { latitude: 12.1, longitude: 77.1 } }  // surplus = 400
    ];
    const res = storageService.findSuitableWarehouses(farm, warehouses);
    console.log('Test 4 Case 3 (Minimum Surplus chosen):', res.selectedWarehouse.warehouseId);
    assert.strictEqual(res.selectedWarehouse.warehouseId, 'WA');
  }

  // Test 5: Case 4 - Same surplus (Select closer distance)
  {
    const farm = { quantity: 400, location: { latitude: 12.0, longitude: 77.0 } };
    const warehouses = [
      { _id: 'WA', name: 'Warehouse Far', availableStorage: 500, location: { latitude: 13.0, longitude: 78.0 } },  // dist ~150km
      { _id: 'WB', name: 'Warehouse Near', availableStorage: 500, location: { latitude: 12.05, longitude: 77.05 } } // dist ~8km
    ];
    const res = storageService.findSuitableWarehouses(farm, warehouses);
    console.log('Test 5 Case 4 (Closer chosen):', res.selectedWarehouse.name);
    assert.strictEqual(res.selectedWarehouse.warehouseId, 'WB');
  }

  // Test 6: Case 5 - Multiple warehouses required (split not performed)
  {
    const farm = { quantity: 600, location: { latitude: 12.0, longitude: 77.0 } };
    const warehouses = [
      { _id: 'WA', name: 'Warehouse A', availableStorage: 300, location: { latitude: 12.1, longitude: 77.1 } },
      { _id: 'WB', name: 'Warehouse B', availableStorage: 300, location: { latitude: 12.2, longitude: 77.2 } }
    ];
    const res = storageService.findSuitableWarehouses(farm, warehouses);
    console.log('Test 6 Case 5 (Requires multiple):', res);
    assert.strictEqual(res.canFullyAccommodate, false);
    assert.strictEqual(res.requiresMultipleWarehouses, true);
    assert.strictEqual(res.selectedWarehouse, null);
  }

  // Test 7: Edge cases - Missing coordinates
  {
    const farm = { quantity: 200 }; // no location
    const warehouses = [
      { _id: 'W1', name: 'Warehouse 1', availableStorage: 500 } // no location
    ];
    const res = storageService.findSuitableWarehouses(farm, warehouses);
    console.log('Test 7 Missing coordinates:', res.selectedWarehouse);
    assert.strictEqual(res.canFullyAccommodate, true);
    assert.strictEqual(res.selectedWarehouse.distanceKm, null);
  }

  console.log('All Storage Feasibility Tests Passed Successfully!');
}

runTests();
