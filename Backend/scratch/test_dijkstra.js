const pathfindingService = require('../services/pathfinding.service');
const assert = require('assert');

function runTests() {
  console.log('--- Running Dijkstra Pathfinding Unit Tests ---');

  // Test Case 1: Direct Path
  {
    const graph = {
      'A': [{ to: 'B', distance: 10, roadId: 'R1' }],
      'B': []
    };
    const res = pathfindingService.findShortestPath(graph, 'A', 'B');
    console.log('Test 1 Direct Path:', res);
    assert.strictEqual(res.reachable, true);
    assert.strictEqual(res.distance, 10);
    assert.deepStrictEqual(res.nodes, ['A', 'B']);
    assert.deepStrictEqual(res.roads, ['R1']);
  }

  // Test Case 2: Indirect Shorter Path (A -> C = 25 vs A -> B -> C = 15)
  {
    const graph = {
      'A': [
        { to: 'B', distance: 10, roadId: 'R1' },
        { to: 'C', distance: 25, roadId: 'R3' }
      ],
      'B': [
        { to: 'C', distance: 5, roadId: 'R2' }
      ],
      'C': []
    };
    const res = pathfindingService.findShortestPath(graph, 'A', 'C');
    console.log('Test 2 Indirect Shorter Path:', res);
    assert.strictEqual(res.reachable, true);
    assert.strictEqual(res.distance, 15);
    assert.deepStrictEqual(res.nodes, ['A', 'B', 'C']);
    assert.deepStrictEqual(res.roads, ['R1', 'R2']);
  }

  // Test Case 3: Multiple Paths (A -> B -> C -> D = 25 km)
  {
    const graph = {
      'A': [
        { to: 'B', distance: 10, roadId: 'R1' },
        { to: 'C', distance: 25, roadId: 'R4' }
      ],
      'B': [
        { to: 'C', distance: 5, roadId: 'R2' },
        { to: 'D', distance: 30, roadId: 'R5' }
      ],
      'C': [
        { to: 'D', distance: 10, roadId: 'R3' }
      ],
      'D': []
    };
    const res = pathfindingService.findShortestPath(graph, 'A', 'D');
    console.log('Test 3 Multiple Paths:', res);
    assert.strictEqual(res.reachable, true);
    assert.strictEqual(res.distance, 25);
    assert.deepStrictEqual(res.nodes, ['A', 'B', 'C', 'D']);
    assert.deepStrictEqual(res.roads, ['R1', 'R2', 'R3']);
  }

  // Test Case 4: Unreachable Destination
  {
    const graph = {
      'A': [{ to: 'B', distance: 10, roadId: 'R1' }],
      'B': [],
      'D': []
    };
    const res = pathfindingService.findShortestPath(graph, 'A', 'D');
    console.log('Test 4 Unreachable:', res);
    assert.strictEqual(res.reachable, false);
    assert.strictEqual(res.distance, null);
    assert.deepStrictEqual(res.nodes, []);
    assert.deepStrictEqual(res.roads, []);
  }

  // Test Case 5: Same Node
  {
    const graph = { 'A': [] };
    const res = pathfindingService.findShortestPath(graph, 'A', 'A');
    console.log('Test 5 Same Node:', res);
    assert.strictEqual(res.reachable, true);
    assert.strictEqual(res.distance, 0);
    assert.deepStrictEqual(res.nodes, ['A']);
    assert.deepStrictEqual(res.roads, []);
  }

  // Test Case 6: Directed Graph Edge Enforcement (B -> A non-existent)
  {
    const graph = {
      'A': [{ to: 'B', distance: 10, roadId: 'R1' }],
      'B': []
    };
    const res = pathfindingService.findShortestPath(graph, 'B', 'A');
    console.log('Test 6 Directed Enforcement:', res);
    assert.strictEqual(res.reachable, false);
  }

  // Test Case 7: Bidirectional Graph Path (B -> A exists)
  {
    const graph = {
      'A': [{ to: 'B', distance: 10, roadId: 'R1' }],
      'B': [{ to: 'A', distance: 10, roadId: 'R1' }]
    };
    const res = pathfindingService.findShortestPath(graph, 'B', 'A');
    console.log('Test 7 Bidirectional Path:', res);
    assert.strictEqual(res.reachable, true);
    assert.strictEqual(res.distance, 10);
  }

  // Test Case 8: Invalid Edge (Negative distance ignored)
  {
    const graph = {
      'A': [{ to: 'B', distance: -10, roadId: 'R_BAD' }],
      'B': []
    };
    const res = pathfindingService.findShortestPath(graph, 'A', 'B');
    console.log('Test 8 Invalid Negative Edge:', res);
    assert.strictEqual(res.reachable, false);
  }

  console.log('All Dijkstra Pathfinding Unit Tests Passed Successfully!');
}

runTests();
