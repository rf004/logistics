const Road = require('../models/road.model');

class RoadRepository {
  async create(roadData) {
    return await Road.create(roadData);
  }

  async findAll() {
    return await Road.find();
  }

  async findById(id) {
    return await Road.findById(id);
  }

  async updateById(id, roadData) {
    return await Road.findByIdAndUpdate(id, roadData, {
      new: true,
      runValidators: true
    });
  }

  async update(id, roadData) {
    return await this.updateById(id, roadData);
  }

  async deleteById(id) {
    return await Road.findByIdAndDelete(id);
  }

  async delete(id) {
    return await this.deleteById(id);
  }
}

module.exports = new RoadRepository();
