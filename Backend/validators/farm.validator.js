const validateCreateFarm = (body) => {
  const errors = [];

  if (!body.name || typeof body.name !== 'string' || !body.name.trim()) {
    errors.push('Farm name is required');
  }
  if (!body.productName || typeof body.productName !== 'string' || !body.productName.trim()) {
    errors.push('Product name is required');
  }
  if (!body.productType || typeof body.productType !== 'string' || !body.productType.trim()) {
    errors.push('Product type is required');
  }
  if (body.quantity === undefined || typeof body.quantity !== 'number' || body.quantity <= 0) {
    errors.push('Quantity must be a positive number');
  }
  if (!body.harvestTime) {
    errors.push('Harvest time is required');
  } else if (isNaN(Date.parse(body.harvestTime))) {
    errors.push('Invalid harvest time date');
  }
  if (body.shelfLife === undefined || typeof body.shelfLife !== 'number' || body.shelfLife <= 0) {
    errors.push('Shelf life must be a positive number');
  }

  if (!body.location || typeof body.location !== 'object') {
    errors.push('Location object is required');
  } else {
    if (body.location.latitude === undefined || typeof body.location.latitude !== 'number') {
      errors.push('Latitude is required');
    }
    if (body.location.longitude === undefined || typeof body.location.longitude !== 'number') {
      errors.push('Longitude is required');
    }
  }

  return errors;
};

const validateUpdateFarm = (body) => {
  const errors = [];

  if (body.name !== undefined && (typeof body.name !== 'string' || !body.name.trim())) {
    errors.push('Farm name cannot be empty');
  }
  if (body.quantity !== undefined && (typeof body.quantity !== 'number' || body.quantity <= 0)) {
    errors.push('Quantity must be a positive number');
  }
  if (body.shelfLife !== undefined && (typeof body.shelfLife !== 'number' || body.shelfLife <= 0)) {
    errors.push('Shelf life must be a positive number');
  }

  return errors;
};

module.exports = {
  validateCreateFarm,
  validateUpdateFarm
};
