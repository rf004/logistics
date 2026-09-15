const ApiError = require('../utils/ApiError');

class UrgencyService {
  /**
   * Calculate urgency metrics for a given farm object
   * @param {Object} farm - Farm object from database or request
   * @returns {Object} Calculated urgency result
   */
  calculateUrgency(farm) {
    if (!farm) {
      throw new ApiError(400, 'Farm object is required');
    }

    const { harvestTime, shelfLife, quantity, productName } = farm;

    // Validate required fields
    if (harvestTime === undefined || harvestTime === null) {
      throw new ApiError(400, 'Harvest time is required for urgency calculation');
    }

    const harvestDate = new Date(harvestTime);
    if (isNaN(harvestDate.getTime())) {
      throw new ApiError(400, 'Invalid harvest time date');
    }

    if (shelfLife === undefined || shelfLife === null || typeof shelfLife !== 'number' || isNaN(shelfLife) || shelfLife <= 0) {
      throw new ApiError(400, 'Shelf life must be a positive number');
    }

    if (quantity === undefined || quantity === null || typeof quantity !== 'number' || isNaN(quantity) || quantity <= 0) {
      throw new ApiError(400, 'Quantity must be a positive number');
    }

    const now = new Date();
    const elapsedMilliseconds = now.getTime() - harvestDate.getTime();
    
    // If harvest time is in the future, elapsedTime is 0
    const elapsedHours = elapsedMilliseconds > 0 ? elapsedMilliseconds / (1000 * 60 * 60) : 0;

    let remainingShelfLife = shelfLife - elapsedHours;
    let isExpired = false;

    if (remainingShelfLife <= 0) {
      remainingShelfLife = 0;
      isExpired = true;
    }

    let remainingPercentage = (remainingShelfLife / shelfLife) * 100;
    
    let urgencyScore;
    let urgencyLevel;

    if (isExpired) {
      urgencyScore = 100;
      urgencyLevel = 'CRITICAL';
      remainingPercentage = 0;
    } else {
      // urgencyScore = 100 - remainingPercentage clamped between 0 and 100
      let rawScore = 100 - remainingPercentage;
      urgencyScore = Math.max(0, Math.min(100, rawScore));

      if (remainingPercentage <= 20) {
        urgencyLevel = 'CRITICAL';
      } else if (remainingPercentage <= 40) {
        urgencyLevel = 'HIGH';
      } else if (remainingPercentage <= 70) {
        urgencyLevel = 'MEDIUM';
      } else {
        urgencyLevel = 'LOW';
      }
    }

    // Format output with maximum of 2 decimal places
    const formattedRemainingShelfLife = Math.round(remainingShelfLife * 100) / 100;
    const formattedRemainingPercentage = Math.round(remainingPercentage * 100) / 100;
    const formattedUrgencyScore = Math.round(urgencyScore * 100) / 100;

    return {
      farmId: farm._id ? farm._id.toString() : farm.farmId || farm.id,
      productName: productName || farm.productName,
      quantity,
      shelfLife,
      remainingShelfLife: formattedRemainingShelfLife,
      remainingPercentage: formattedRemainingPercentage,
      urgencyScore: formattedUrgencyScore,
      urgencyLevel,
      isExpired
    };
  }
}

module.exports = new UrgencyService();
