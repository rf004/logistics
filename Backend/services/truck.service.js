const mongoose = require('mongoose');
const truckRepository = require('../repositories/truck.repository');
const ApiError = require('../utils/ApiError');

class TruckService {
  async createTruck(truckData) {
    return await truckRepository.create(truckData);
  }

  async getAllTrucks() {
    return await truckRepository.findAll();
  }

  async getTruckById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Truck ID');
    }

    const truck = await truckRepository.findById(id);
    if (!truck) {
      throw new ApiError(404, 'Truck not found');
    }

    return truck;
  }

  async updateTruck(id, truckData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Truck ID');
    }

    const truck = await truckRepository.updateById(id, truckData);
    if (!truck) {
      throw new ApiError(404, 'Truck not found');
    }

    return truck;
  }

  async deleteTruck(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Truck ID');
    }

    const truck = await truckRepository.deleteById(id);
    if (!truck) {
      throw new ApiError(404, 'Truck not found');
    }

    return truck;
  }
}

module.exports = new TruckService();
