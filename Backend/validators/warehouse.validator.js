const validateCreateWarehouse = (body) => {
  const errors = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Warehouse name is required');
  }

  if (!body.location || typeof body.location !== 'object') {
    errors.push('Location object is required');
  } else {
    if (body.location.latitude === undefined || typeof body.location.latitude !== 'number') {
      errors.push('Latitude is required');
    } else if (body.location.latitude < -90 || body.location.latitude > 90) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (body.location.longitude === undefined || typeof body.location.longitude !== 'number') {
      errors.push('Longitude is required');
    } else if (body.location.longitude < -180 || body.location.longitude > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  if (body.capacity === undefined || typeof body.capacity !== 'number') {
    errors.push('Capacity is required');
  } else if (body.capacity <= 0) {
    errors.push('Capacity must be greater than 0');
  }

  if (body.availableStorage === undefined || typeof body.availableStorage !== 'number') {
    errors.push('Available storage is required');
  } else if (body.availableStorage < 0) {
    errors.push('Available storage cannot be negative');
  }

  if (
    typeof body.capacity === 'number' &&
    typeof body.availableStorage === 'number' &&
    body.availableStorage > body.capacity
  ) {
    errors.push('Available storage cannot exceed capacity');
  }

  return errors;
};

const validateUpdateWarehouse = (body) => {
  const errors = [];

  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    errors.push('Warehouse name cannot be empty');
  }

  if (body.location !== undefined) {
    if (typeof body.location !== 'object' || body.location === null) {
      errors.push('Location must be an object');
    } else {
      if (body.location.latitude !== undefined) {
        if (typeof body.location.latitude !== 'number' || body.location.latitude < -90 || body.location.latitude > 90) {
          errors.push('Latitude must be between -90 and 90');
        }
      }
      if (body.location.longitude !== undefined) {
        if (typeof body.location.longitude !== 'number' || body.location.longitude < -180 || body.location.longitude > 180) {
          errors.push('Longitude must be between -180 and 180');
        }
      }
    }
  }

  if (body.capacity !== undefined) {
    if (typeof body.capacity !== 'number' || body.capacity <= 0) {
      errors.push('Capacity must be greater than 0');
    }
  }

  if (body.availableStorage !== undefined) {
    if (typeof body.availableStorage !== 'number' || body.availableStorage < 0) {
      errors.push('Available storage cannot be negative');
    }
  }

  if (
    typeof body.capacity === 'number' &&
    typeof body.availableStorage === 'number' &&
    body.availableStorage > body.capacity
  ) {
    errors.push('Available storage cannot exceed capacity');
  }

  return errors;
};

module.exports = {
  validateCreateWarehouse,
  validateUpdateWarehouse
};
