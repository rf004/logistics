const routeOptimizationService = require('../services/routeOptimization.service');
const assert = require('assert');

function runTests() {
  console.log('--- Running Multi-Farm Pickup Sequence Optimization Tests ---');

  // Test Case 1: Primary Urgency Selection
  {
    const truckState = {
      truckId: 'T1',
      capacity: 500,
      initialLoad: 0,
      truck: { name: 'Depot' }
    };
    const warehouse = { _id: 'W1', name: 'W1' };
    const graph = {
      'Depot': [{ to: 'F1', distance: 30, roadId: 'R1' }, { to: 'F2', distance: 5, roadId: 'R2' }],
      'F1': [{ to: 'F2', distance: 10, roadId: 'R3' }, { to: 'W1', distance: 20, roadId: 'R4' }],
      'F2': [{ to: 'F1', distance: 10, roadId: 'R5' }, { to: 'W1', distance: 25, roadId: 'R6' }],
      'W1': []
    };
    const assignedFarms = [
      { farm: { _id: 'F1', name: 'F1', quantity: 100 }, urgency: { urgencyScore: 95 } },
      { farm: { _id: 'F2', name: 'F2', quantity: 100 }, urgency: { urgencyScore: 60 } }
    ];

    const res = routeOptimizationService.optimizePickupSequence({
      truckState,
      assignedFarms,
      warehouse,
      graph
    });

    console.log('Test 1 (Primary Urgency Selection):', res.pickupSequence);
    assert.strictEqual(res.pickupSequence[0], 'F1');
    assert.strictEqual(res.pickupSequence[1], 'F2');
    assert.strictEqual(res.routeComplete, true);
  }

  // Test Case 2: Urgency Tie-Breaking by Distance (within threshold 5)
  {
    const truckState = {
      truckId: 'T1',
      capacity: 500,
      initialLoad: 0,
      truck: { name: 'Depot' }
    };
    const warehouse = { _id: 'W1', name: 'W1' };
    const graph = {
      'Depot': [{ to: 'F1', distance: 30, roadId: 'R1' }, { to: 'F2', distance: 5, roadId: 'R2' }],
      'F1': [{ to: 'F2', distance: 10, roadId: 'R3' }, { to: 'W1', distance: 20, roadId: 'R4' }],
      'F2': [{ to: 'F1', distance: 10, roadId: 'R5' }, { to: 'W1', distance: 25, roadId: 'R6' }],
      'W1': []
    };
    // F1 urgency = 95, F2 urgency = 92. Difference = 3 (<= threshold 5)
    // Depot -> F2 is 5km vs Depot -> F1 is 30km. F2 should be selected first!
    const assignedFarms = [
      { farm: { _id: 'F1', name: 'F1', quantity: 100 }, urgency: { urgencyScore: 95 } },
      { farm: { _id: 'F2', name: 'F2', quantity: 100 }, urgency: { urgencyScore: 92 } }
    ];

    const res = routeOptimizationService.optimizePickupSequence({
      truckState,
      assignedFarms,
      warehouse,
      graph
    });

    console.log('Test 2 (Distance Tie-Breaker within Threshold):', res.pickupSequence);
    assert.strictEqual(res.pickupSequence[0], 'F2');
    assert.strictEqual(res.pickupSequence[1], 'F1');
    assert.strictEqual(res.routeComplete, true);
  }

  // Test Case 3: Significant Urgency Difference Overrides Distance
  {
    const truckState = {
      truckId: 'T1',
      capacity: 500,
      initialLoad: 0,
      truck: { name: 'Depot' }
    };
    const warehouse = { _id: 'W1', name: 'W1' };
    const graph = {
      'Depot': [{ to: 'F1', distance: 50, roadId: 'R1' }, { to: 'F2', distance: 5, roadId: 'R2' }],
      'F1': [{ to: 'F2', distance: 10, roadId: 'R3' }, { to: 'W1', distance: 20, roadId: 'R4' }],
      'F2': [{ to: 'F1', distance: 10, roadId: 'R5' }, { to: 'W1', distance: 25, roadId: 'R6' }],
      'W1': []
    };
    // F1 urgency = 95, F2 urgency = 60. Difference = 35 (> threshold 5)
    const assignedFarms = [
      { farm: { _id: 'F1', name: 'F1', quantity: 100 }, urgency: { urgencyScore: 95 } },
      { farm: { _id: 'F2', name: 'F2', quantity: 100 }, urgency: { urgencyScore: 60 } }
    ];

    const res = routeOptimizationService.optimizePickupSequence({
      truckState,
      assignedFarms,
      warehouse,
      graph
    });

    console.log('Test 3 (Significant Urgency Overrides Distance):', res.pickupSequence);
    assert.strictEqual(res.pickupSequence[0], 'F1');
    assert.strictEqual(res.pickupSequence[1], 'F2');
  }

  // Test Case 4: Truck Capacity Boundary & Unserved Farm
  {
    const truckState = {
      truckId: 'T1',
      capacity: 500,
      initialLoad: 0,
      truck: { name: 'Depot' }
    };
    const warehouse = { _id: 'W1', name: 'W1' };
    const graph = {
      'Depot': [{ to: 'F1', distance: 10, roadId: 'R1' }, { to: 'F2', distance: 15, roadId: 'R2' }],
      'F1': [{ to: 'W1', distance: 20, roadId: 'R3' }],
      'W1': []
    };
    const assignedFarms = [
      { farm: { _id: 'F1', name: 'F1', quantity: 300 }, urgency: { urgencyScore: 90 } },
      { farm: { _id: 'F2', name: 'F2', quantity: 250 }, urgency: { urgencyScore: 80 } }
    ];

    const res = routeOptimizationService.optimizePickupSequence({
      truckState,
      assignedFarms,
      warehouse,
      graph
    });

    console.log('Test 4 (Capacity Exceeded Unserved Farm):', res);
    assert.strictEqual(res.pickupSequence.length, 1);
    assert.strictEqual(res.pickupSequence[0], 'F1');
    assert.strictEqual(res.unservedFarms.length, 1);
    assert.strictEqual(res.unservedFarms[0].reason, 'CAPACITY_EXCEEDED');
  }

  // Test Case 5: Unreachable Farm
  {
    const truckState = {
      truckId: 'T1',
      capacity: 500,
      initialLoad: 0,
      truck: { name: 'Depot' }
    };
    const warehouse = { _id: 'W1', name: 'W1' };
    const graph = {
      'Depot': [{ to: 'F2', distance: 10, roadId: 'R2' }],
      'F2': [{ to: 'W1', distance: 15, roadId: 'R3' }],
      'W1': []
    };
    const assignedFarms = [
      { farm: { _id: 'F1', name: 'F1', quantity: 100 }, urgency: { urgencyScore: 95 } }, // F1 not in graph
      { farm: { _id: 'F2', name: 'F2', quantity: 100 }, urgency: { urgencyScore: 80 } }
    ];

    const res = routeOptimizationService.optimizePickupSequence({
      truckState,
      assignedFarms,
      warehouse,
      graph
    });

    console.log('Test 5 (Unreachable Farm Handling):', res);
    assert.strictEqual(res.pickupSequence.length, 1);
    assert.strictEqual(res.pickupSequence[0], 'F2');
    assert.strictEqual(res.unservedFarms[0].reason, 'UNREACHABLE');
  }

  console.log('All Multi-Farm Pickup Sequence Optimization Tests Passed Successfully!');
}

runTests();
