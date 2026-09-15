const Warehouse = require('../models/warehouse.model');

class WarehouseRepository {
  async create(warehouseData) {
    return await Warehouse.create(warehouseData);
  }

  async findAll() {
    return await Warehouse.find();
  }

  async findById(id) {
    return await Warehouse.findById(id);
  }

  async updateById(id, warehouseData) {
    return await Warehouse.findByIdAndUpdate(id, warehouseData, {
      new: true,
      runValidators: true
    });
  }

  async update(id, warehouseData) {
    return await this.updateById(id, warehouseData);
  }

  async deleteById(id) {
    return await Warehouse.findByIdAndDelete(id);
  }

  async delete(id) {
    return await this.deleteById(id);
  }
}

module.exports = new WarehouseRepository();
