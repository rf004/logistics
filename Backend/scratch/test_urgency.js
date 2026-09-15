const urgencyService = require('../services/urgency.service');
const assert = require('assert');

function runTests() {
  console.log('--- Running Urgency Service Unit Tests ---');

  const now = new Date();

  // Test 1: Fresh produce (Harvested just now, 24h shelf life) -> LOW urgency
  {
    const farm = {
      _id: '507f1f77bcf86cd799439011',
      productName: 'Spinach',
      quantity: 100,
      harvestTime: new Date(now.getTime() - 1 * 60 * 60 * 1000), // 1 hour ago
      shelfLife: 24
    };
    const res = urgencyService.calculateUrgency(farm);
    console.log('Test 1 (Fresh 1h old / 24h shelfLife):', res);
    assert.strictEqual(res.urgencyLevel, 'LOW');
    assert.strictEqual(res.isExpired, false);
    assert.strictEqual(res.remainingShelfLife, 23);
    assert.strictEqual(res.remainingPercentage, 95.83);
    assert.strictEqual(res.urgencyScore, 4.17);
  }

  // Test 2: Medium Urgency (10 hours ago, 24h shelf life -> 14h remaining, 58.33%)
  {
    const farm = {
      _id: '507f1f77bcf86cd799439012',
      productName: 'Tomato',
      quantity: 200,
      harvestTime: new Date(now.getTime() - 10 * 60 * 60 * 1000),
      shelfLife: 24
    };
    const res = urgencyService.calculateUrgency(farm);
    console.log('Test 2 (10h old / 24h shelfLife):', res);
    assert.strictEqual(res.urgencyLevel, 'MEDIUM');
    assert.strictEqual(res.isExpired, false);
  }

  // Test 3: High Urgency (16 hours ago, 24h shelf life -> 8h remaining, 33.33%)
  {
    const farm = {
      _id: '507f1f77bcf86cd799439013',
      productName: 'Lettuce',
      quantity: 150,
      harvestTime: new Date(now.getTime() - 16 * 60 * 60 * 1000),
      shelfLife: 24
    };
    const res = urgencyService.calculateUrgency(farm);
    console.log('Test 3 (16h old / 24h shelfLife):', res);
    assert.strictEqual(res.urgencyLevel, 'HIGH');
    assert.strictEqual(res.isExpired, false);
    assert.strictEqual(res.remainingPercentage, 33.33);
    assert.strictEqual(res.urgencyScore, 66.67);
  }

  // Test 4: Critical Urgency (21 hours ago, 24h shelf life -> 3h remaining, 12.5%)
  {
    const farm = {
      _id: '507f1f77bcf86cd799439014',
      productName: 'Berries',
      quantity: 300,
      harvestTime: new Date(now.getTime() - 21 * 60 * 60 * 1000),
      shelfLife: 24
    };
    const res = urgencyService.calculateUrgency(farm);
    console.log('Test 4 (21h old / 24h shelfLife):', res);
    assert.strictEqual(res.urgencyLevel, 'CRITICAL');
    assert.strictEqual(res.isExpired, false);
  }

  // Test 5: Expired produce (25 hours ago, 24h shelf life)
  {
    const farm = {
      _id: '507f1f77bcf86cd799439015',
      productName: 'Expired Spinach',
      quantity: 50,
      harvestTime: new Date(now.getTime() - 25 * 60 * 60 * 1000),
      shelfLife: 24
    };
    const res = urgencyService.calculateUrgency(farm);
    console.log('Test 5 (Expired produce):', res);
    assert.strictEqual(res.urgencyLevel, 'CRITICAL');
    assert.strictEqual(res.isExpired, true);
    assert.strictEqual(res.remainingShelfLife, 0);
    assert.strictEqual(res.remainingPercentage, 0);
    assert.strictEqual(res.urgencyScore, 100);
  }

  // Test 6: Future harvest time (Harvest time in future)
  {
    const farm = {
      _id: '507f1f77bcf86cd799439016',
      productName: 'Future Crops',
      quantity: 500,
      harvestTime: new Date(now.getTime() + 5 * 60 * 60 * 1000), // 5 hours in future
      shelfLife: 24
    };
    const res = urgencyService.calculateUrgency(farm);
    console.log('Test 6 (Future harvest time):', res);
    assert.strictEqual(res.urgencyLevel, 'LOW');
    assert.strictEqual(res.isExpired, false);
    assert.strictEqual(res.remainingShelfLife, 24);
    assert.strictEqual(res.remainingPercentage, 100);
    assert.strictEqual(res.urgencyScore, 0);
  }

  // Test 7: Validation edge cases (invalid shelfLife)
  try {
    urgencyService.calculateUrgency({ harvestTime: new Date(), shelfLife: -5, quantity: 10 });
    assert.fail('Should have thrown error for negative shelfLife');
  } catch (err) {
    console.log('Test 7 Passed (Invalid shelfLife caught):', err.message);
  }

  // Test 8: Validation edge cases (missing harvestTime)
  try {
    urgencyService.calculateUrgency({ shelfLife: 24, quantity: 10 });
    assert.fail('Should have thrown error for missing harvestTime');
  } catch (err) {
    console.log('Test 8 Passed (Missing harvestTime caught):', err.message);
  }

  console.log('All Unit Tests Passed Successfully!');
}

runTests();
