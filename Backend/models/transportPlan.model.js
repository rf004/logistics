const mongoose = require('mongoose');
const { Schema } = mongoose;

const transportPlanSchema = new Schema(
  {
    truckId: {
      type: Schema.Types.ObjectId,
      ref: 'Truck',
      required: [true, 'Truck reference is required']
    },
    warehouseId: {
      type: Schema.Types.ObjectId,
      ref: 'Warehouse',
      required: [true, 'Warehouse reference is required']
    },
    farms: [
      {
        farmId: {
          type: Schema.Types.ObjectId,
          ref: 'Farm',
          required: true
        },
        pickupOrder: {
          type: Number,
          required: true
        },
        quantity: {
          type: Number,
          required: true
        },
        urgency: {
          type: Number,
          required: true
        }
      }
    ],
    route: {
      startNode: {
        type: String,
        required: true
      },
      pickupSequence: [
        {
          type: String,
          required: true
        }
      ],
      warehouseNode: {
        type: String,
        required: true
      },
      legs: [
        {
          from: { type: String, required: true },
          to: { type: String, required: true },
          distance: { type: Number, required: true },
          roads: [{ type: String }],
          nodes: [{ type: String }]
        }
      ],
      totalDistance: {
        type: Number,
        required: true,
        min: [0, 'Total distance cannot be negative']
      }
    },
    totalLoad: {
      type: Number,
      required: true,
      min: [0, 'Total load cannot be negative']
    },
    status: {
      type: String,
      enum: {
        values: ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
        message: 'Status must be PLANNED, IN_PROGRESS, COMPLETED, or CANCELLED'
      },
      default: 'PLANNED'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('TransportPlan', transportPlanSchema);
