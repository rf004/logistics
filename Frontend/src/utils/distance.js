/**
 * Haversine formula to compute great-circle distance between 2 coordinates in kilometers
 */
export function calculateHaversineDistance(locA, locB) {
  if (!locA || !locB) return null;
  const lat1 = typeof locA.latitude === 'number' ? locA.latitude : locA.lat;
  const lon1 = typeof locA.longitude === 'number' ? locA.longitude : locA.lng;
  const lat2 = typeof locB.latitude === 'number' ? locB.latitude : locB.lat;
  const lon2 = typeof locB.longitude === 'number' ? locB.longitude : locB.lng;

  if (lat1 === undefined || lon1 === undefined || lat2 === undefined || lon2 === undefined) {
    return null;
  }

  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth's radius in km

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c * 100) / 100;
}
