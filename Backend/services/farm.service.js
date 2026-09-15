const mongoose = require('mongoose');
const farmRepository = require('../repositories/farm.repository');
const ApiError = require('../utils/ApiError');

class FarmService {
  async createFarm(farmData) {
    return await farmRepository.create(farmData);
  }

  async getAllFarms() {
    return await farmRepository.findAll();
  }

  async getFarmById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Farm ID');
    }

    const farm = await farmRepository.findById(id);
    if (!farm) {
      throw new ApiError(404, 'Farm not found');
    }

    return farm;
  }

  async updateFarm(id, farmData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Farm ID');
    }

    const farm = await farmRepository.updateById(id, farmData);
    if (!farm) {
      throw new ApiError(404, 'Farm not found');
    }

    return farm;
  }

  async deleteFarm(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Farm ID');
    }

    const farm = await farmRepository.deleteById(id);
    if (!farm) {
      throw new ApiError(404, 'Farm not found');
    }

    return farm;
  }
}

module.exports = new FarmService();
