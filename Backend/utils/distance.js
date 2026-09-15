/**
 * Calculate Haversine distance in kilometers between two geographic locations
 * @param {Object} pointA - { latitude, longitude } or { location: { latitude, longitude } }
 * @param {Object} pointB - { latitude, longitude } or { location: { latitude, longitude } }
 * @returns {number|null} Distance in km, rounded to 2 decimal places, or null if coordinates are missing/invalid
 */
function calculateHaversineDistance(pointA, pointB) {
  const locA = pointA && pointA.location ? pointA.location : pointA;
  const locB = pointB && pointB.location ? pointB.location : pointB;

  if (
    !locA ||
    !locB ||
    typeof locA.latitude !== 'number' ||
    typeof locA.longitude !== 'number' ||
    typeof locB.latitude !== 'number' ||
    typeof locB.longitude !== 'number' ||
    isNaN(locA.latitude) ||
    isNaN(locA.longitude) ||
    isNaN(locB.latitude) ||
    isNaN(locB.longitude)
  ) {
    return null;
  }

  const toRad = (value) => (value * Math.PI) / 180;

  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(locB.latitude - locA.latitude);
  const dLon = toRad(locB.longitude - locA.longitude);

  const lat1 = toRad(locA.latitude);
  const lat2 = toRad(locB.latitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance * 100) / 100;
}

module.exports = {
  calculateHaversineDistance
};
