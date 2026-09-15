const Truck = require('../models/truck.model');

class TruckRepository {
  async create(truckData) {
    return await Truck.create(truckData);
  }

  async findAll() {
    return await Truck.find();
  }

  async findById(id) {
    return await Truck.findById(id);
  }

  async updateById(id, truckData) {
    return await Truck.findByIdAndUpdate(id, truckData, {
      new: true,
      runValidators: true
    });
  }

  async deleteById(id) {
    return await Truck.findByIdAndDelete(id);
  }
}

module.exports = new TruckRepository();
