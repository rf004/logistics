const mongoose = require('mongoose');
const roadRepository = require('../repositories/road.repository');
const ApiError = require('../utils/ApiError');

class RoadService {
  async createRoad(roadData) {
    return await roadRepository.create(roadData);
  }

  async getAllRoads() {
    return await roadRepository.findAll();
  }

  async getRoadById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Road ID');
    }

    const road = await roadRepository.findById(id);
    if (!road) {
      throw new ApiError(404, 'Road not found');
    }

    return road;
  }

  async updateRoad(id, roadData) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Road ID');
    }

    const road = await roadRepository.updateById(id, roadData);
    if (!road) {
      throw new ApiError(404, 'Road not found');
    }

    return road;
  }

  async deleteRoad(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new ApiError(400, 'Invalid Road ID');
    }

    const road = await roadRepository.deleteById(id);
    if (!road) {
      throw new ApiError(404, 'Road not found');
    }

    return road;
  }
}

module.exports = new RoadService();
