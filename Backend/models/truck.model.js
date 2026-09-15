const mongoose = require('mongoose');

const truckSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Truck name is required'],
      trim: true
    },
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0.0001, 'Capacity must be greater than 0']
    },
    currentLocation: {
      latitude: {
        type: Number,
        required: [true, 'Latitude is required'],
        min: [-90, 'Latitude must be between -90 and 90'],
        max: [90, 'Latitude must be between -90 and 90']
      },
      longitude: {
        type: Number,
        required: [true, 'Longitude is required'],
        min: [-180, 'Longitude must be between -180 and 180'],
        max: [180, 'Longitude must be between -180 and 180']
      }
    },
    width: {
      type: Number,
      required: [true, 'Width is required'],
      min: [0.0001, 'Width must be greater than 0']
    },
    height: {
      type: Number,
      required: [true, 'Height is required'],
      min: [0.0001, 'Height must be greater than 0']
    },
    length: {
      type: Number,
      required: [true, 'Length is required'],
      min: [0.0001, 'Length must be greater than 0']
    },
    maxWeight: {
      type: Number,
      required: [true, 'Max weight is required'],
      min: [0.0001, 'Max weight must be greater than 0']
    },
    available: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Truck', truckSchema);
