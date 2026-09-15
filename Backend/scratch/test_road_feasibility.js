const roadFeasibilityService = require('../services/roadFeasibility.service');
const assert = require('assert');

function runTests() {
  console.log('--- Running Road Feasibility & Graph Building Unit Tests ---');

  // Test Case 1: Basic Road & Weight Restriction
  {
    const truckLight = { maxWeight: 5, width: 2.5 }; // 5 tons
    const truckHeavy = { maxWeight: 15, width: 2.5 }; // 15 tons
    const road = { _id: 'R1', maxWeight: 10, maxWidth: 3.0, status: 'OPEN', vehicleAllowed: true };

    assert.strictEqual(roadFeasibilityService.canTruckUseRoad(truckLight, road), true);
    assert.strictEqual(roadFeasibilityService.canTruckUseRoad(truckHeavy, road), false);
    console.log('Test 1 Passed: Basic road & weight restriction filtering');
  }

  // Test Case 2: Width Restriction
  {
    const truckWide = { maxWeight: 5, width: 4.0 };
    const roadNarrow = { _id: 'R2', maxWeight: 10, maxWidth: 3.0, status: 'OPEN', vehicleAllowed: true };

    assert.strictEqual(roadFeasibilityService.canTruckUseRoad(truckWide, roadNarrow), false);
    console.log('Test 2 Passed: Width restriction filtering');
  }

  // Test Case 3: Closed Road
  {
    const truck = { maxWeight: 5, width: 2.0 };
    const roadClosed = { _id: 'R3', maxWeight: 10, maxWidth: 3.0, status: 'CLOSED' };

    assert.strictEqual(roadFeasibilityService.canTruckUseRoad(truck, roadClosed), false);
    console.log('Test 3 Passed: Closed road filtering');
  }

  // Test Case 4: Bidirectional vs Directional Road Graph
  {
    const truck = { maxWeight: 5, width: 2.0 };
    const roads = [
      {
        _id: 'R1',
        startLocation: { latitude: 12.0, longitude: 77.0 },
        endLocation: { latitude: 12.1, longitude: 77.1 },
        distance: 10,
        maxWeight: 10,
        maxWidth: 3.0,
        status: 'OPEN',
        isBidirectional: true
      },
      {
        _id: 'R2',
        startLocation: { latitude: 12.1, longitude: 77.1 },
        endLocation: { latitude: 12.2, longitude: 77.2 },
        distance: 15,
        maxWeight: 10,
        maxWidth: 3.0,
        status: 'OPEN',
        isBidirectional: false
      }
    ];

    const result = roadFeasibilityService.buildTruckGraph(truck, roads);
    console.log('Test 4 Formatted Graph:', JSON.stringify(result.graph, null, 2));

    // R1 is bidirectional between 12,77 and 12.1,77.1
    const nodeA = '12,77';
    const nodeB = '12.1,77.1';
    const nodeC = '12.2,77.2';

    assert.strictEqual(result.graph[nodeA].length, 1);
    assert.strictEqual(result.graph[nodeB].length, 2); // R1 back to A, R2 to C
    assert.strictEqual(result.graph[nodeC] ? result.graph[nodeC].length : 0, 0); // Directional R2 ends at C
    console.log('Test 4 Passed: Directional & Bidirectional graph construction');
  }

  // Test Case 5: Truck-Specific Graph (Different trucks get different graphs)
  {
    const truckLight = { maxWeight: 4, width: 2.0 };
    const truckHeavy = { maxWeight: 12, width: 2.0 };

    const roads = [
      {
        _id: 'R1',
        startLocation: { latitude: 10.0, longitude: 20.0 },
        endLocation: { latitude: 10.1, longitude: 20.1 },
        distance: 10,
        maxWeight: 15,
        status: 'OPEN'
      },
      {
        _id: 'R2',
        startLocation: { latitude: 10.1, longitude: 20.1 },
        endLocation: { latitude: 10.2, longitude: 20.2 },
        distance: 5,
        maxWeight: 8, // Heavy truck (12) cannot pass R2
        status: 'OPEN'
      }
    ];

    const lightRes = roadFeasibilityService.buildTruckGraph(truckLight, roads);
    const heavyRes = roadFeasibilityService.buildTruckGraph(truckHeavy, roads);

    assert.strictEqual(lightRes.feasibleRoads.length, 2);
    assert.strictEqual(heavyRes.feasibleRoads.length, 1);
    assert.strictEqual(heavyRes.feasibleRoads[0], 'R1');
    console.log('Test 5 Passed: Truck-specific graph differentiation');
  }

  // Test Case 6: Invalid Distance Road Exclusion
  {
    const truck = { maxWeight: 5 };
    const invalidRoad = {
      _id: 'R_BAD',
      startLocation: { latitude: 1.0, longitude: 1.0 },
      endLocation: { latitude: 2.0, longitude: 2.0 },
      distance: -5,
      maxWeight: 10,
      status: 'OPEN'
    };

    const res = roadFeasibilityService.buildTruckGraph(truck, [invalidRoad]);
    assert.strictEqual(res.routePossible, false);
    console.log('Test 6 Passed: Invalid negative distance road exclusion');
  }

  console.log('All Road Feasibility Unit Tests Passed Successfully!');
}

runTests();
