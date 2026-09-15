const mongoose = require('mongoose');
const warehouseRepository = require('../repositories/warehouse.repository');
const ApiError = require('../utils/ApiError');

class WarehouseService {
  async createWarehouse(warehouseData) {
    if (warehouseData.availableStorage > warehouseData.capacity) {
      throw new ApiError(400, 'Available storage cannot exceed capacity');
    }
    return await warehouseRepository.create(warehouseData);
  }

  async getAllWarehouses() {
    return await warehouseRepository.findAll();
  }

  async getWarehouseById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Warehouse ID');
    }

    const warehouse = await warehouseRepository.findById(id);
    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }

    return warehouse;
  }

  async updateWarehouse(id, warehouseData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Warehouse ID');
    }

    const existingWarehouse = await warehouseRepository.findById(id);
    if (!existingWarehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }

    const targetCapacity = warehouseData.capacity !== undefined ? warehouseData.capacity : existingWarehouse.capacity;
    const targetAvailableStorage = warehouseData.availableStorage !== undefined ? warehouseData.availableStorage : existingWarehouse.availableStorage;

    if (targetCapacity <= 0) {
      throw new ApiError(400, 'Capacity must be greater than 0');
    }

    if (targetAvailableStorage < 0) {
      throw new ApiError(400, 'Available storage cannot be negative');
    }

    if (targetAvailableStorage > targetCapacity) {
      throw new ApiError(400, 'Available storage cannot exceed capacity');
    }

    const updatedWarehouse = await warehouseRepository.updateById(id, warehouseData);
    return updatedWarehouse;
  }

  async deleteWarehouse(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Warehouse ID');
    }

    const warehouse = await warehouseRepository.deleteById(id);
    if (!warehouse) {
      throw new ApiError(404, 'Warehouse not found');
    }

    return warehouse;
  }
}

module.exports = new WarehouseService();
