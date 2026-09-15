const ALLOWED_STATUSES = ['OPEN', 'CLOSED', 'RESTRICTED'];

const validateCreateRoad = (body) => {
  const errors = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Road name is required');
  }

  if (!body.startLocation || typeof body.startLocation !== 'object') {
    errors.push('Start location object is required');
  } else {
    if (body.startLocation.latitude === undefined || typeof body.startLocation.latitude !== 'number') {
      errors.push('Start latitude is required');
    } else if (body.startLocation.latitude < -90 || body.startLocation.latitude > 90) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (body.startLocation.longitude === undefined || typeof body.startLocation.longitude !== 'number') {
      errors.push('Start longitude is required');
    } else if (body.startLocation.longitude < -180 || body.startLocation.longitude > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  if (!body.endLocation || typeof body.endLocation !== 'object') {
    errors.push('End location object is required');
  } else {
    if (body.endLocation.latitude === undefined || typeof body.endLocation.latitude !== 'number') {
      errors.push('End latitude is required');
    } else if (body.endLocation.latitude < -90 || body.endLocation.latitude > 90) {
      errors.push('Latitude must be between -90 and 90');
    }

    if (body.endLocation.longitude === undefined || typeof body.endLocation.longitude !== 'number') {
      errors.push('End longitude is required');
    } else if (body.endLocation.longitude < -180 || body.endLocation.longitude > 180) {
      errors.push('Longitude must be between -180 and 180');
    }
  }

  if (body.distance === undefined || typeof body.distance !== 'number' || body.distance <= 0) {
    errors.push('Distance must be a positive number');
  }

  if (body.maxWidth === undefined || typeof body.maxWidth !== 'number' || body.maxWidth <= 0) {
    errors.push('Max width must be a positive number');
  }

  if (body.maxHeight === undefined || typeof body.maxHeight !== 'number' || body.maxHeight <= 0) {
    errors.push('Max height must be a positive number');
  }

  if (body.maxWeight === undefined || typeof body.maxWeight !== 'number' || body.maxWeight <= 0) {
    errors.push('Max weight must be a positive number');
  }

  if (body.vehicleAllowed !== undefined && typeof body.vehicleAllowed !== 'boolean') {
    errors.push('Vehicle allowed must be a boolean');
  }

  if (body.status !== undefined && !ALLOWED_STATUSES.includes(body.status)) {
    errors.push('Status must be OPEN, CLOSED, or RESTRICTED');
  }

  return errors;
};

const validateUpdateRoad = (body) => {
  const errors = [];

  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    errors.push('Road name cannot be empty');
  }

  if (body.startLocation !== undefined) {
    if (typeof body.startLocation !== 'object' || body.startLocation === null) {
      errors.push('Start location must be an object');
    } else {
      if (body.startLocation.latitude !== undefined) {
        if (typeof body.startLocation.latitude !== 'number' || body.startLocation.latitude < -90 || body.startLocation.latitude > 90) {
          errors.push('Latitude must be between -90 and 90');
        }
      }
      if (body.startLocation.longitude !== undefined) {
        if (typeof body.startLocation.longitude !== 'number' || body.startLocation.longitude < -180 || body.startLocation.longitude > 180) {
          errors.push('Longitude must be between -180 and 180');
        }
      }
    }
  }

  if (body.endLocation !== undefined) {
    if (typeof body.endLocation !== 'object' || body.endLocation === null) {
      errors.push('End location must be an object');
    } else {
      if (body.endLocation.latitude !== undefined) {
        if (typeof body.endLocation.latitude !== 'number' || body.endLocation.latitude < -90 || body.endLocation.latitude > 90) {
          errors.push('Latitude must be between -90 and 90');
        }
      }
      if (body.endLocation.longitude !== undefined) {
        if (typeof body.endLocation.longitude !== 'number' || body.endLocation.longitude < -180 || body.endLocation.longitude > 180) {
          errors.push('Longitude must be between -180 and 180');
        }
      }
    }
  }

  if (body.distance !== undefined && (typeof body.distance !== 'number' || body.distance <= 0)) {
    errors.push('Distance must be a positive number');
  }

  if (body.maxWidth !== undefined && (typeof body.maxWidth !== 'number' || body.maxWidth <= 0)) {
    errors.push('Max width must be a positive number');
  }

  if (body.maxHeight !== undefined && (typeof body.maxHeight !== 'number' || body.maxHeight <= 0)) {
    errors.push('Max height must be a positive number');
  }

  if (body.maxWeight !== undefined && (typeof body.maxWeight !== 'number' || body.maxWeight <= 0)) {
    errors.push('Max weight must be a positive number');
  }

  if (body.vehicleAllowed !== undefined && typeof body.vehicleAllowed !== 'boolean') {
    errors.push('Vehicle allowed must be a boolean');
  }

  if (body.status !== undefined && !ALLOWED_STATUSES.includes(body.status)) {
    errors.push('Status must be OPEN, CLOSED, or RESTRICTED');
  }

  return errors;
};

module.exports = {
  validateCreateRoad,
  validateUpdateRoad
};
