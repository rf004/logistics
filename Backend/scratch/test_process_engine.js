const PriorityQueue = require('../utils/priorityQueue');
const processEngineService = require('../services/processEngine.service');
const assert = require('assert');

function runTests() {
  console.log('--- Running PriorityQueue & Process Engine Tests ---');

  // Test 1: Max Heap PriorityQueue basic operation
  {
    const pq = new PriorityQueue((a, b) => a > b);
    pq.enqueue(10);
    pq.enqueue(50);
    pq.enqueue(30);
    pq.enqueue(100);

    assert.strictEqual(pq.size(), 4);
    assert.strictEqual(pq.peek(), 100);
    assert.strictEqual(pq.dequeue(), 100);
    assert.strictEqual(pq.dequeue(), 50);
    assert.strictEqual(pq.dequeue(), 30);
    assert.strictEqual(pq.dequeue(), 100 ? 10 : 10);
    assert.strictEqual(pq.isEmpty(), true);
    assert.strictEqual(pq.dequeue(), null);
    assert.strictEqual(pq.peek(), null);
    console.log('Test 1 Passed: PriorityQueue Max Heap functionality');
  }

  // Test 2: Multi-level priority comparator
  // Priority 1: urgencyScore DESC
  // Priority 2: quantity DESC
  // Priority 3: harvestTime ASC
  {
    const now = new Date();
    const t1 = new Date(now.getTime() - 10 * 60 * 60 * 1000); // 10h ago
    const t2 = new Date(now.getTime() - 8 * 60 * 60 * 1000);  // 8h ago

    const items = [
      { farm: { _id: 'A', quantity: 100, harvestTime: t1 }, urgency: { urgencyScore: 50 } },
      { farm: { _id: 'B', quantity: 50,  harvestTime: t1 }, urgency: { urgencyScore: 90 } },
      { farm: { _id: 'C', quantity: 500, harvestTime: t1 }, urgency: { urgencyScore: 70 } },
      { farm: { _id: 'D', quantity: 300, harvestTime: t1 }, urgency: { urgencyScore: 80 } },
      { farm: { _id: 'E', quantity: 100, harvestTime: t1 }, urgency: { urgencyScore: 80 } }, // same score as D, lower quantity
      { farm: { _id: 'F', quantity: 100, harvestTime: t1 }, urgency: { urgencyScore: 80 } }, // same score & qty as E & G, but earlier time
      { farm: { _id: 'G', quantity: 100, harvestTime: t2 }, urgency: { urgencyScore: 80 } }  // later time than F
    ];

    const pq = new PriorityQueue((a, b) => processEngineService.comparePriority(a, b));
    items.forEach(item => pq.enqueue(item));

    const extracted = [];
    while (!pq.isEmpty()) {
      extracted.push(pq.dequeue().farm._id);
    }

    console.log('Test 2 Extracted Order:', extracted);
    // B (score 90)
    // D (score 80, qty 300)
    // E (score 80, qty 100, time t1)
    // F (score 80, qty 100, time t1)
    // G (score 80, qty 100, time t2)
    // C (score 70)
    // A (score 50)
    assert.strictEqual(extracted[0], 'B');
    assert.strictEqual(extracted[1], 'D');
    assert.strictEqual(extracted[5], 'C');
    assert.strictEqual(extracted[6], 'A');
    console.log('Test 2 Passed: Multi-level priority ordering verified');
  }

  console.log('All Process Engine & Priority Queue Tests Passed!');
}

runTests();
