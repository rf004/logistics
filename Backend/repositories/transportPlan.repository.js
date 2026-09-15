const TransportPlan = require('../models/transportPlan.model');

class TransportPlanRepository {
  async create(planData) {
    return await TransportPlan.create(planData);
  }

  async findById(id) {
    return await TransportPlan.findById(id);
  }

  async findAll(filter = {}) {
    return await TransportPlan.find(filter).sort({ createdAt: -1 });
  }

  async updateStatus(id, newStatus) {
    return await TransportPlan.findByIdAndUpdate(
      id,
      { status: newStatus },
      { new: true, runValidators: true }
    );
  }
}

module.exports = new TransportPlanRepository();
