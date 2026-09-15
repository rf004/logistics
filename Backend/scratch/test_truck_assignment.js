const truckAssignmentService = require('../services/truckAssignment.service');
const assert = require('assert');

function runTests() {
  console.log('--- Running Truck Assignment Service Unit Tests ---');

  // Test Case 1: Simple Assignment
  {
    const trucks = [{ _id: 'T1', name: 'Truck 1', capacity: 500, available: true }];
    const states = truckAssignmentService.initTruckStates(trucks);
    const farm = { _id: 'A', quantity: 300 };

    const best = truckAssignmentService.selectBestTruck(farm, states);
    assert.strictEqual(best.truckId, 'T1');

    const res = truckAssignmentService.assignFarmToTruck(farm, best);
    console.log('Test 1 Passed (Simple Assignment):', res);
    assert.strictEqual(res.assigned, true);
    assert.strictEqual(res.loadBeforeAssignment, 0);
    assert.strictEqual(res.loadAfterAssignment, 300);
    assert.strictEqual(res.remainingCapacity, 200);
  }

  // Test Case 2: Multiple Farm Assignment
  {
    const trucks = [{ _id: 'T1', name: 'Truck 1', capacity: 500, available: true }];
    const states = truckAssignmentService.initTruckStates(trucks);
    
    const farmA = { _id: 'A', quantity: 300 };
    const farmB = { _id: 'B', quantity: 150 };

    let best = truckAssignmentService.selectBestTruck(farmA, states);
    truckAssignmentService.assignFarmToTruck(farmA, best);

    best = truckAssignmentService.selectBestTruck(farmB, states);
    assert.strictEqual(best.truckId, 'T1');

    const resB = truckAssignmentService.assignFarmToTruck(farmB, best);
    console.log('Test 2 Passed (Multiple Farm Assignment):', resB);
    assert.strictEqual(resB.assigned, true);
    assert.strictEqual(resB.loadAfterAssignment, 450);
    assert.strictEqual(resB.remainingCapacity, 50);
    assert.deepStrictEqual(states[0].assignedFarms, ['A', 'B']);
  }

  // Test Case 3: Capacity Exceeded
  {
    const trucks = [{ _id: 'T1', name: 'Truck 1', capacity: 500, available: true }];
    const states = truckAssignmentService.initTruckStates(trucks);
    
    const farmA = { _id: 'A', quantity: 300 };
    const farmB = { _id: 'B', quantity: 250 };

    const bestA = truckAssignmentService.selectBestTruck(farmA, states);
    truckAssignmentService.assignFarmToTruck(farmA, bestA);

    const bestB = truckAssignmentService.selectBestTruck(farmB, states);
    console.log('Test 3 Passed (Capacity Exceeded):', bestB);
    assert.strictEqual(bestB, null);
  }

  // Test Case 4: Two Trucks
  {
    const trucks = [
      { _id: 'T1', name: 'Truck 1', capacity: 500, available: true },
      { _id: 'T2', name: 'Truck 2', capacity: 400, available: true }
    ];
    const states = truckAssignmentService.initTruckStates(trucks);

    const farms = [
      { _id: 'A', quantity: 300 },
      { _id: 'B', quantity: 150 },
      { _id: 'C', quantity: 100 }
    ];

    farms.forEach((farm) => {
      const best = truckAssignmentService.selectBestTruck(farm, states);
      assert.notStrictEqual(best, null);
      truckAssignmentService.assignFarmToTruck(farm, best);
    });

    console.log('Test 4 Passed (Two Trucks Summary):', states.map(s => ({ id: s.truckId, load: s.assignedLoad, remaining: s.remainingCapacity, farms: s.assignedFarms })));
  }

  // Test Case 5: Best Fit (Smallest remaining capacity preferred)
  {
    const trucks = [
      { _id: 'T1', name: 'Truck 500', capacity: 500, available: true },
      { _id: 'T2', name: 'Truck 250', capacity: 250, available: true },
      { _id: 'T3', name: 'Truck 200', capacity: 200, available: true }
    ];
    const states = truckAssignmentService.initTruckStates(trucks);
    const farm = { _id: 'A', quantity: 200 };

    const best = truckAssignmentService.selectBestTruck(farm, states);
    console.log('Test 5 Passed (Best Fit Chosen):', best.name);
    assert.strictEqual(best.truckId, 'T3'); // T3 leaves 0 remaining capacity
  }

  // Test Case 6: No Feasible Truck
  {
    const trucks = [
      { _id: 'T1', name: 'Truck 1', capacity: 500, available: true },
      { _id: 'T2', name: 'Truck 2', capacity: 400, available: true }
    ];
    const states = truckAssignmentService.initTruckStates(trucks);
    const farm = { _id: 'A', quantity: 700 };

    const best = truckAssignmentService.selectBestTruck(farm, states);
    console.log('Test 6 Passed (No Feasible Truck):', best);
    assert.strictEqual(best, null);
  }

  // Test Case 7: Existing Truck Load & Unavailable Truck
  {
    const trucks = [
      { _id: 'T1', name: 'Truck Busy', capacity: 1000, available: false },
      { _id: 'T2', name: 'Truck Loaded', capacity: 500, currentLoad: 200, available: true }
    ];
    const states = truckAssignmentService.initTruckStates(trucks);
    assert.strictEqual(states.length, 1); // T1 excluded as available: false
    assert.strictEqual(states[0].remainingCapacity, 300);

    const farm = { _id: 'A', quantity: 250 };
    const best = truckAssignmentService.selectBestTruck(farm, states);
    assert.strictEqual(best.truckId, 'T2');

    const res = truckAssignmentService.assignFarmToTruck(farm, best);
    console.log('Test 7 Passed (Existing Load & Unavailable Truck):', res);
    assert.strictEqual(res.loadBeforeAssignment, 200);
    assert.strictEqual(res.loadAfterAssignment, 450);
    assert.strictEqual(res.remainingCapacity, 50);
  }

  console.log('All Truck Assignment Unit Tests Passed Successfully!');
}

runTests();
