const validateCreateTruck = (body) => {
  const errors = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Truck name is required');
  }

  if (body.capacity === undefined || typeof body.capacity !== 'number' || body.capacity <= 0) {
    errors.push('Capacity must be a positive number');
  }

  if (body.width === undefined || typeof body.width !== 'number' || body.width <= 0) {
    errors.push('Width must be a positive number');
  }

  if (body.height === undefined || typeof body.height !== 'number' || body.height <= 0) {
    errors.push('Height must be a positive number');
  }

  if (body.length === undefined || typeof body.length !== 'number' || body.length <= 0) {
    errors.push('Length must be a positive number');
  }

  if (body.maxWeight === undefined || typeof body.maxWeight !== 'number' || body.maxWeight <= 0) {
    errors.push('Max weight must be a positive number');
  }

  if (!body.currentLocation || typeof body.currentLocation !== 'object') {
    errors.push('Current location object is required');
  } else {
    if (body.currentLocation.latitude === undefined || typeof body.currentLocation.latitude !== 'number') {
      errors.push('Latitude is required');
    }
    if (body.currentLocation.longitude === undefined || typeof body.currentLocation.longitude !== 'number') {
      errors.push('Longitude is required');
    }
  }

  return errors;
};

const validateUpdateTruck = (body) => {
  const errors = [];

  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    errors.push('Truck name cannot be empty');
  }
  if (body.capacity !== undefined && (typeof body.capacity !== 'number' || body.capacity <= 0)) {
    errors.push('Capacity must be a positive number');
  }
  if (body.width !== undefined && (typeof body.width !== 'number' || body.width <= 0)) {
    errors.push('Width must be a positive number');
  }
  if (body.height !== undefined && (typeof body.height !== 'number' || body.height <= 0)) {
    errors.push('Height must be a positive number');
  }
  if (body.length !== undefined && (typeof body.length !== 'number' || body.length <= 0)) {
    errors.push('Length must be a positive number');
  }
  if (body.maxWeight !== undefined && (typeof body.maxWeight !== 'number' || body.maxWeight <= 0)) {
    errors.push('Max weight must be a positive number');
  }

  return errors;
};

module.exports = {
  validateCreateTruck,
  validateUpdateTruck
};
