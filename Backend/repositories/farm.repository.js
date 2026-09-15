const Farm = require('../models/farm.model');

class FarmRepository {
  async create(farmData) {
    return await Farm.create(farmData);
  }

  async findAll() {
    return await Farm.find();
  }

  async findById(id) {
    return await Farm.findById(id);
  }

  async updateById(id, farmData) {
    return await Farm.findByIdAndUpdate(id, farmData, {
      new: true,
      runValidators: true
    });
  }

  async deleteById(id) {
    return await Farm.findByIdAndDelete(id);
  }
}

module.exports = new FarmRepository();
