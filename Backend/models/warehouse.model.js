const mongoose = require('mongoose');

const warehouseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Warehouse name is required'],
      trim: true
    },
    location: {
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
    capacity: {
      type: Number,
      required: [true, 'Capacity is required'],
      min: [0.0001, 'Capacity must be greater than 0']
    },
    availableStorage: {
      type: Number,
      required: [true, 'Available storage is required'],
      min: [0, 'Available storage cannot be negative'],
      validate: {
        validator: function (value) {
          if (this.capacity !== undefined && value !== undefined) {
            return value <= this.capacity;
          }
          return true;
        },
        message: 'Available storage cannot be greater than capacity'
      }
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Warehouse', warehouseSchema);
